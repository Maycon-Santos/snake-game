/**
 * Main class that starts the game
 * It receives as parameter the canvas that goes the whole game
 *
 * @param {*} $canvas
 */
function Game($canvas){

    // Define properties
    var tileSize;
    var status
    var $game = $canvas.parentNode;
    var mute = localStorage.getItem("mute") == 'true';

    Object.defineProperties(this, {

        // ID of socket
        id: { writable: true },

        tileSize: {

            set: val => {
                tileSize = Math.floor(+val);
                $canvas.width = this.tileSize * gameProps.tiles[0];
                $canvas.height = this.tileSize * gameProps.tiles[1];
                $canvas.style.backgroundSize = `${this.tileSize}px ${this.tileSize}px`;
            },

            get: () => tileSize

        },

        ctx: {
            value: $canvas.getContext('2d'),
            writable: false
        },

        status: {

            set: newStatus => {
                if(newStatus == 'game-over') this.sounds.gameOver.play;
                $game.className = status = newStatus;
            },

            get: () => status

        },

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

        mute: {
            
            set: Bool => {

                mute = !!Bool;
                localStorage.setItem('mute', mute);
                this.interface.audioToggle(mute);

            },

            get: () => mute

        },

        winner: { writable: true },

        playersInTheRoom: { value: [], writable: false },

        players: { value: [], writable: false },

        foods: { value: [], writable: false },

        multiplayerLocalAllow: { value: false },

        socket: { value: io(), writable: false }

    });

    /*
    * Factory:
    *   The objects have to be instantiated later because they receive "this" as a parameter and trying to access the properties before will probably give the error.
    */
    Object.defineProperties(this, {

        engine: { value: new Engine(this), writable: false },

        interface: { value: new Interface(this), writable: false },

        sounds: { value: new Sounds(this), writable: false }

    });

    this.socket.on('teste', t => console.log(t));

    this.interface.audioToggle(mute);
    gestureViewer(this);

    this.engine.run();

}

Game.prototype.start = function(){

    this.interface.closeModal();
    this.clear();

    this.addPlayers();
    this.addFoods();

    this.status = "playing";

}

Game.prototype.clear = function(){
    this.players.clear();
    this.foods.clear();
    this.winner = null;
    this.engine.clear();
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

    let playersInTheRoom = this.playersInTheRoom.length;
    for (let i = 0; i < playersInTheRoom; i++) {

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
        let tileSize = [0, 0].map((_, i) => winSize[i] / gameProps.tiles[i]);
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
        this.multiplayerLocalAllow = data.multiplayerLocal;

        this.id = data.myID;

        this.playersInTheRoom = data.playersInTheRoom;
    
        this.playersInTheRoom.push(data.player);

        this.resizeCanvas();
        this.socketEvents();

        if(typeof callback == 'function') callback(data);

    });

    this.socket.on('multiplayer disabled', () => {
        this.socket.off('login');
        this.socket.off('logged');
        this.socket.off('multiplayer disabled');

        this.interface.dialogBox.alert('Danied', 'Local multiplayer disabled.');
    });

}

Game.prototype.socketEvents = function(){

    this.socket.on('start', () => {
        
        this.start();
        this.interface.listPlayersInGame();

    });

    game.socket.on('game over', winner => {

        this.winner = winner;
        this.status = 'game-over';
        this.interface.gameOver();

    });

    this.socket.on('newPlayer', player => {
        this.playersInTheRoom.push(player);
        this.interface.listPlayersInTheRoom();
    });

    this.socket.on('prepare game', arr => {

        this.playersInTheRoom.push(...arr);
        this.socket.emit('start');

    });

    this.socket.on('playersInTheRoom update', data => {
        var i = data.i;
        delete data.i;
        this.playersInTheRoom[i] = Object.assign(this.playersInTheRoom[i], data);  
        game.interface.listPlayersInTheRoom();      
    });

    this.socket.on('delete player', i => {
        delete this.playersInTheRoom[i];
        this.playersInTheRoom = this.playersInTheRoom.filter(Boolean);
        this.interface.listPlayersInTheRoom();
    });

    this.socket.on('update', updates => {

        for (const key in updates) {
            for (const i in updates[key])
                this[key][i] = Object.assign(this[key][i], updates[key][i]);
        }

    });

    this.socket.on('multiplayer-local address', this.interface.openMultiplayerLocal);

    this.socket.on('multiplayer-local deny', () => {

        this.playersInTheRoom.clear();
        this.clear();
        this.interface.open('login');

        this.socket.emit('logout');

        this.interface.dialogBox.alert('Danied', 'Local multiplayer disabled.', () => location.reload());

    });

}