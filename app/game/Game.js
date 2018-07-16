/**
 * Main class that starts the game
 */
function Game(){

    var status = 'toStart';

    Object.defineProperties(this, {

        players: { value: [], writable: false },
        playersInTheRoom: { value: [], writable: false },
        foods: { value: [], writable: false },

        mode: { value: 'deathmatch' },

        roomCreator: { writable: true },

        multiplayerLocalAllow: { value: false },

        readyPlayers: { value: 0, enumerable: true },

        colorsInUse: {
            get: () => {

                var colorsInUse = [];

                for (let i = this.playersInTheRoom.length - 1; i >= 0; i--) {
                    const player = this.playersInTheRoom[i];
                    colorsInUse.push(player.color);
                }

                return colorsInUse;

            }
        },

        winner: {

            get: () => {

                var winner;
                this.for('players', player => {
                    if(!player.killed) winner = player;
                });
    
                return winner;
    
            }

        },

        status: {

            get: () => status,

            set: st => {

                if(st == 'over') {

                    if(!this.multiplayerLocalAllow) game.playersInTheRoom.length = 1;

                    io.emit('game over', this.winner);
                    this.clear();

                }

                status = st;

            }

        }

    });

    /*
    * Factory:
    *   The objects have to be instantiated later because they receive "this" as a parameter and trying to access the properties before will probably give the error.
    */
    Object.defineProperty(this, 'engine', { value: new Engine(this), writable: false });

    this.engine.run();

}

Game.prototype.event = new events.EventEmitter();

Game.prototype.clear = function(){
    this.players.clear();
    this.foods.clear();
    this.readyPlayers = 0;
    this.engine.clear();
}

Game.prototype.start = function(){

    this.clear();
    
    new GameRules(this);

    this.addFoods();
    this.addPlayers();

    this.status = "playing";

}

Game.prototype.for = function(object, fn){

    if(typeof object == 'object'){

        for(let i = 0, L = object.length; i < L; i++){
            
            if(fn(object[i], i) == false) break;
        }

    }else{

        for(let id = 0, L = this[object].length; id < L; id++){
            if(fn(this[object][id], id) == false) break;
        }

    }

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

    var color = Math.round(Math.random() * (gameProps.snakes.colors.length - 1));
    
    return this.colorsInUse.includes(color) ? this.generateColor() : color;

}

Game.prototype.createPlayers = function(qnt){

    let players = [];

    for (let i = 0; i < qnt; i++) {
        
        let player = {
            id: `comp-${i}`,
            enhancerId: this.playersInTheRoom.length,
            AI: true,
            nickname: `Computer ${i + 1}`,
            bodyStart: newBodyStart(this.playersInTheRoom.length),
            color: this.generateColor()
        }

        this.playersInTheRoom.push(player);
        players.push(player);
        
    }

    io.emit('teste', this.playersInTheRoom);

    return players;

}