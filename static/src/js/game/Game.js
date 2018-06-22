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

    this.players = [];
    this.foods = [];

    this.status = 'toStart';
    this.engine = new Engine(this);
    this.interface = new Interface(this);
    this.socket = io();

    this.socket.emit('connection');
    this.socket.on('teste', data => {
        console.log(data);
    });

    new gameRules(this);

    this.addPlayers();
    this.addFoods();

    //this.newGame();
    gestureViewer();

    this.resizeCanvas();
    this.engine.run();

}

Game.prototype.newGame = function(){

    this.status = "playing";

    this.for('foods', food => {
        food.create();
    });

    this.for('players', player => {
        player.newBody();
    });

}

Game.prototype.for = function(object, fn){
    for (let id = this[object].length-1; id >= 0; id--)
        fn(this[object][id], id);
}

Game.prototype.addPlayers = function(){

    let player = new Snake(this, this.players.length);

    this.players.push(player);

    if(this.players.length < gameProps.snakes.players.length)
        this.addPlayers();

}

Game.prototype.addFoods = function(){
    let food = new Food(this);

    this.engine.add(food);
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

Game.prototype.login = function(playerNickname){

    this.socket.emit('login', playerNickname);

    this.socket.on('logged', data => {
        console.log(data);
    });

}