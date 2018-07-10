function Game(){

    this.playersInTheRoom = [];

    this.engine = new Engine(this);

    this.localhost = false;
    this.mode = 'deathmatch';

    this.roomCreator = null;
    this.multiplayerLocalAllow = false;

    this.readyPlayers = 0;

    this.engine.run();

    Object.defineProperty(this, 'colorsInUse', {
        get: () => {
            var colorsInUse = [];
            for (let i = this.playersInTheRoom.length - 1; i >= 0; i--) {
                const player = this.playersInTheRoom[i];
                colorsInUse.push(player.color);
            }
            return colorsInUse;
        }
    });

    Object.defineProperty(this, 'winner', {
        get: () => {

            var winner;
            this.for('players', player => {
                if(!player.killed) winner = player;
            });

            return winner;

        }
    });

    var status = 'toStart';
    Object.defineProperty(this, 'status', {
        get: () => status,
        set: st => {
            if(st == 'over') {
                if(!this.localhost) game.playersInTheRoom.length = 1;
                else this.localhost = false;

                io.emit('game over', this.winner);
                this.clear();
            }
            status = st;
        }
    });

}

Game.prototype.event = new events.EventEmitter();

Game.prototype.clear = function(){
    this.players = [];
    this.foods = [];
    this.readyPlayers = 0;
    this.engine.clear();
}

Game.prototype.newGame = function(){

    this.clear();
    
    new GameRules(this);

    this.addFoods();
    this.addPlayers();

    this.status = "playing";

}

Game.prototype.for = function(object, fn){
    for(let id = 0, L = this[object].length; id < L; id++)
        fn(this[object][id], id);
}

Game.prototype.addPlayers = function(){

    for (let i = this.playersInTheRoom.length - 1; i >= 0 ; i--) {
        const playerInTheRoom = this.playersInTheRoom[i];

        let player = new Snake(this, playerInTheRoom);

        this.players.push(player);
    }

}

Game.prototype.addFoods = function(){

    for (let i = 0; i < gameProps.foods.qnt; i++) {        
        let food = new Food(this, this.foods.length);
        this.foods.push(food);
    }

}

Game.prototype.generateColor = function(){

    var color = Math.round(Math.random()*gameProps.snakes.colors.length);
    
    return this.colorsInUse.includes(color) ? this.generateColor() : color;

}

Game.prototype.createPlayers = function(qnt){

    let players = [];

    for (let i = 0; i < qnt; i++) {
        
        let player = {
            id: `comp-${i}`,
            enhancerId: this.playersInTheRoom.length,
            AI: true,
            nickname: `Computer ${this.playersInTheRoom.length + 1}`,
            bodyStart: newBodyStart(this.playersInTheRoom.length),
            color: this.generateColor()
        }

        this.playersInTheRoom.push(player);
        players.push(player);
        
    }

    io.emit('teste', this.playersInTheRoom);

    return players;

}