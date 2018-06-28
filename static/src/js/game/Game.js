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

}

Game.prototype.addPlayers = function(){

    for (let i = this.playersInTheRoom.length - 1; i >= 0 ; i--) {
        const playerInTheRoom = this.playersInTheRoom[i];

        let player = new Snake(this, playerInTheRoom);

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


    var $snakes = document.querySelectorAll('.snake-chooser .snake');
    const chooseSnake_snakeSize = () => {
        for (let i = $snakes.length - 1; i >= 0; i--) {
            $snakes[i].style.width = `${this.tileSize}px`;
            $snakes[i].style.height = `${this.tileSize}px`;
        }
    }

    const resizeCanvas = () => {
       
        let winSize = [window.innerWidth, window.innerHeight]; // X, Y
        let tileSize = [0, 0].map((val, i) => winSize[i] / gameProps.tiles[i]);
        this.tileSize = tileSize[tileSize[0] > tileSize[1] ? 1 : 0];

        chooseSnake_snakeSize();
        
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

}

Game.prototype.login = function(playerNickname, callback){

    this.socket.emit('login', {
        playerNickname: playerNickname
    });

    this.socket.on('logged', data =>{

        gameProps = Object.assign(gameProps, data.gameProps);

        data.player.idLocal = 0;

        this.id = data.myID;
        this.playersInTheRoom.push(data.player);
        this.playersInTheRoom = Object.assign(this.playersInTheRoom, data.playersInTheRoom);
        
        this.resizeCanvas();

        if(typeof callback == 'function') callback(data);

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

    this.socket.on('prepare multiplayer', arr => {
        for (let i = arr.length - 1; i >= 0; i--) {
            const player = arr[i];
            this.playersInTheRoom.push(player);
        }
        this.socket.emit('multiplayer');
    });

    this.socket.on('playersInTheRoom update', data => {
        var i = data.i;
        delete data.i;
        this.playersInTheRoom[i] = Object.assign(this.playersInTheRoom[i], data);        
    });

    this.socket.on('delPlayer', i => {
        delete this.playersInTheRoom[i];
        this.playersInTheRoom = this.playersInTheRoom.filter(Boolean);
    });

}