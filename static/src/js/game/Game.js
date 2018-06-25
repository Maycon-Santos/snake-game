function Game(canvas){

    // Properties
    var tileSize;
    Object.defineProperty(this, 'tileSize', {
        set: function(val){
            if(+val) tileSize = Math.floor(+val);
            else return console.error('Invalid value');
            canvas.width = this.tileSize * gameProps.tiles[0];
            canvas.height = this.tileSize * gameProps.tiles[1];
        },
        get: function(){ return tileSize; }
    });

    Object.defineProperty(this, 'ctx', {
        value: canvas.getContext('2d'),
        writable: false
    });

    var status, $game = canvas.parentNode;
    Object.defineProperty(this, 'status', {
        set: newStatus =>
            $game.className = status = newStatus,
        get: () => status
    });

    this.playersInTheRoom = [];

    this.id = null;
    this.players = [];
    this.foods = [];

    this.status = 'toStart';
    this.engine = new Engine(this);
    this.interface = new Interface(this);
    this.socket = io();

    this.socket.on('teste', t => console.log(t))

    gestureViewer();

    this.engine.run();

    this.socketEvents();
}

Game.prototype.newGame = function(){

    this.status = "playing";

    // this.for('foods', food => {
    //     food.create();
    // });

}

Game.prototype.for = function(object, fn){
    for (let id = this[object].length-1; id >= 0; id--)
        fn(this[object][id], id);
}

Game.prototype.addPlayers = function(){

    for (let i = this.playersInTheRoom.length - 1; i >= 0 ; i--) {
        const playerInTheRoom = this.playersInTheRoom[i];

        let player = Object.assign(new Snake(this, playerInTheRoom.id), playerInTheRoom.playerProps);

        this.players.push(player);

    }

}

Game.prototype.addFoods = function(){
    let food = new Food(this, this.foods.length);

    this.foods.push(food);

    if(this.foods.length < gameProps.foods.qnt)
        this.addFoods();
}

Game.prototype.resizeCanvas = function(){

    const resizeCanvas = () => {
       
        let winSize = [window.innerWidth, window.innerHeight]; // X, Y
        let tileSize = [0, 0].map((val, i) => winSize[i] / gameProps.tiles[i]);
        this.tileSize = tileSize[tileSize[0] > tileSize[1] ? 1 : 0];
        
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

}

Game.prototype.login = function(playerNickname, callback){

    this.socket.emit('login', {
        playerNickname: playerNickname
    });

    this.socket.on('logged', data =>{

        if(typeof callback == 'function') callback(data);

        gameProps = Object.assign(gameProps, data.gameProps);

        this.id = data.myID;
        this.playersInTheRoom = data.players;

        this.resizeCanvas();

    });

}

Game.prototype.socketEvents = function(){

    this.socket.on('start', () => {

        this.interface.closeModal();

        this.addPlayers();
        this.addFoods();
        this.newGame();
        
        this.socket.emit('start');
    });

    this.socket.on('newPlayer', player =>
        this.playersInTheRoom.push(player));

}