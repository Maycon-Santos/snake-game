/**
 * Main class that starts the game
 */
function Game(){

    // Define properties
    var status = 'toStart',
        gameRules;

    Object.defineProperties(this, {

        // Stores the players before sending for the engine to process
        playersInTheRoom: { value: [], writable: false },

        // Players to be processed by engine
        players: { value: [], writable: false },
        
        // Foods to be processed by the engine
        foods: { value: [], writable: false },

        // Socket id of the room creator
        roomCreator: { writable: true },

        multiplayerLocalAllow: { value: false, writable: true },

        // Players in the room who are ready to start
        readyPlayers: { value: 0, writable: true },

        // Colors in use by other users
        colorsInUse: {
            get: () => {

                var colorsInUse = [];

                this.for('playersInTheRoom', player =>
                    colorsInUse.push(player.color));

                return colorsInUse;

            }
        },

        // Get the winner of the match
        winner: {

            get: () => {

                var winner;
                this.for('players', player => {
                    if(!player.killed) winner = player;
                });
    
                return winner;
    
            }

        },

        // Status of the game "playing, game-over, etc..."
        status: {

            get: () => status,

            set: newStatus => {

                if(newStatus == 'over') {

                    // Clear if the player is alone
                    if(!this.multiplayerLocalAllow)
                        game.playersInTheRoom.length = 1;

                    // Emit the winner
                    io.emit('game over', this.winner);

                    this.clear();
                    this.gameRules.close();

                    // Clear the game engine
                    this.clear();

                }

                status = newStatus;

            }

        },

        gameRules: {
            value: {
                get take(){ return gameRules; },
                init: () => gameRules = new GameRules(this),
                close: () => gameRules = undefined
            },

            writable: false
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

    this.gameRules.init();

    // Add foods and players to engine
    this.addFoods();
    this.addPlayers();

    // Set the status of the game
    this.status = "playing";

}

// Shortcut to loop with for
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

    this.for('playersInTheRoom', player =>
        this.players.push(new Snake(this, player)));

}

Game.prototype.addFoods = function(){

    for (let i = 0; i < gameProps.foods.qnt; i++) {        
        let food = new Food(this, this.foods.length);
        this.foods.push(food);
    }

}

// Get an unused color
Game.prototype.generateColor = function(){

    var color = Math.round(Math.random() * (gameProps.snakes.colors.length - 1));
    return this.colorsInUse.includes(color) ? this.generateColor() : color;

}

// Create players with A.I
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