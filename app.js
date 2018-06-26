Array.prototype.isEqual = function(arr){

    return JSON.stringify(this) === JSON.stringify(arr);

}

Array.prototype.sumWith = function(...arrays){
    var arrays = [this, ...arrays].sort((a, b) => b.length - a.length), // Order by DESC
        newArray = [...arrays[0]]; // Largest array of the list

    for (let i = 1, arrLeng = arrays.length; i < arrLeng; i++) {
        const array = arrays[i];
        for (let j = 0, itemLeng = array.length; j < itemLeng; j++) {
            const item = array[j];
            newArray[j] += item;
        }
    }

    return newArray;
}

Array.prototype.lastItem = function(){

    return this[this.length - 1];

}

const electron = require('electron');
const events = require('events');
const express = require('express');
const app = express();
const port = 5000;
const server = app.listen(port);

const eventEmitter = new events.EventEmitter();

app.use(express.static('static'));

const io = require('socket.io')(server);

var mainWindow;
electron.app.on('ready', () => {

    mainWindow = new electron.BrowserWindow({
        width: 1024,
        height: 720
    });

    mainWindow.setMenuBarVisibility(false);

    mainWindow.webContents.openDevTools();

    app.use(express.static('static'));
    
    mainWindow.loadURL(`http://localhost:${port}`);

});

electron.app.on('window-all-closed', () => {
    electron.app.quit();
});
function Engine(){

    var objects = [];

    const runFunction = (fn, ...args) => {

        //io.emit('teste', objects);

        var i = objects.length;

        while(i--){
            if(typeof objects[i][fn] == 'function') objects[i][fn](...args);
        }

    }

    // const update = (deltaTime) => {
    //     io.emit('teste', deltaTime);
    // }

    const update = (deltaTime) => runFunction('update', deltaTime);

    const draw = () => {

    }

    this.run = () => {

        let lastUpdate = Date.now();
        
        const run = () => {

            let now = Date.now();
            let deltaTime = (now - lastUpdate) / 1000;
            deltaTime = Math.min(1, deltaTime);

            if(deltaTime >= 1)
                lastUpdate = now;

            update(deltaTime);
            draw();

        };

        setInterval(run, 0);

    }

    this.add = (object) => objects.push(object);

}
function Food(game, id){

    this.id = id;

    var foodTypes = []
    this.type;

    this.position = [];

    game.engine.add(this);

    for (const key in gameProps.foods.types) {
        const foodType = gameProps.foods.types[key],
              chance = foodType.chance;

        for (let i = 0; i < chance; i++) foodTypes.push(foodType);
    }

    this.create = function(){

        const selectFood = Math.round(Math.random() * (foodTypes.length - 1));

        this.type = foodTypes[selectFood];

        this.position = [[], []].map((_, axis) => Math.round(Math.random() * (gameProps.tiles[axis] - 1)));
    
        io.emit('teste', 'food');
        io.emit(`foodUpdate-${id}`, {position: this.position, type: this.type});
    }

}
function Game(){

    this.playersInTheRoom = [];
    this.players = [];
    this.foods = [];

    this.status = 'toStart';
    this.engine = new Engine(this);

    new GameRules(this);

    this.engine.run();

}

Game.prototype.newGame = function(){

    this.addPlayers();
    this.addFoods();

    this.for('players', player => {
        player.newBody();
    });

    this.for('foods', food => {
        food.create();
    });

    this.status = "playing";

}

Game.prototype.for = function(object, fn){
    for (let id = this[object].length-1; id >= 0; id--)
        fn(this[object][id], id);
}

Game.prototype.addPlayers = function(){

    io.emit('teste', this.playersInTheRoom);

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
var gameProps = {
    tiles: [64, 36], // X, Y

    snakes: {
        speed: 15,
        initialSize: 3,
        initialDirection: "right",
        reverse: false,
        sensibilityTouch: 30, // the higher, the less sensitive

        keyMaps: [
            {left: "ArrowLeft", right: "ArrowRight", up: "ArrowUp", down: "ArrowDown"},
            {left: "a", right: "d", up: "w", down: "s"}
        ],

        colors: [
            '#000000', // Black
            '#ff0000', // Red
            '#00ff00', // Green
            '#0000ff' // Blue
        ]
    },

    foods: {
        qnt: 1,

        types: {
            normal: {
                chance: 5,
                color: '#FFE400'
            },

            freezer: {
                chance: 0,
                color: '#008F30'
            },

            superSpeed: {
                chance: 0,
                color: '#008F30'
            }
        }

    }

}
function GameRules(game){

    game.engine.add(this);

    const snakeColision = () => {

        game.for('players', (player, id) => {

            if(player.killed) return;

            let playerHead = player.head; // For performance. Accessing an object several times is heavy

            for (let index = player.body.length - 1; index >= 0; index--) {

                if(index > 0 && player.body[index].isEqual(playerHead))
                    return player.collided = true;

            }

            !player.collided && game.for('players', (otherPlayer, otherID) => {

                if(id == otherID || otherPlayer.killed) return;

                for (let index = otherPlayer.body.length - 1; index >= 0; index--) {

                    if(otherPlayer.body[index].isEqual(playerHead))
                        return player.collided = true;

                }

            });

        });

        game.for('players', player => player.killed = player.collided); // Kill the player if collided
    
    }

    const snakeAteFood = () => {
        game.for('foods', food => {
            game.for('players', player => {
                if(player.head.isEqual(food.position)){
                    player.increase++;
                    food.create();
                }
            });
        })
    }

    this.update = () => {

        if(game.status != 'playing') return;

        snakeColision();
        snakeAteFood();

    }

}
const newBodyStart = id => [5 * (id+1), 5 * (id+1), 'down'];
function Snake(game, id){

    this.id = id;
    this.body = [];

    this.increase = 0;
    this.collided = false;

    this.bodyStart = [0, 0];

    const directionMap = {
        'left': [-1, 0],
        'right': [1, 0],
        'up': [0, -1],
        'down': [0, 1]
    }

    var direction = gameProps.snakes.initialDirection;
    Object.defineProperty(this, 'direction', {
        get: () => direction,
        set: (to) => {

            let directions = Object.keys(directionMap), // X, Y
                oldDirection = direction,
                reverse = gameProps.snakes.reverse;

            if(directions.includes(to)) direction = to;

            if(nextPos().isEqual(this.body[1])){

                if(!reverse) direction = oldDirection;
                else{
                    direction = this.tailDirection;
                    this.body.reverse();
                }

            }

        }
    });

    Object.defineProperties(this, {
        head: { get: () => this.body[0] },
        tail: { get: () => this.body[this.body.length - 1]},
        tailDirection: {
            get: () => {
                let penultBodyFragment = this.body[this.body.length - 2],
                    tail = this.tail;

                if(tail[0] > penultBodyFragment[0]) return 'right';
                if(tail[0] < penultBodyFragment[0]) return 'left';

                if(tail[1] > penultBodyFragment[1]) return 'down';
                if(tail[1] < penultBodyFragment[1]) return 'up';

            }
        }
    });

    var killed = false;
    Object.defineProperty(this, 'killed', {
        get: () => killed,
        set: (Bool) => {
            killed = !!Bool;
            io.emit(`snakeUpdate-${id}`, {killed: killed});
        }
    });

    game.engine.add(this);
    const snakeControls = new SnakeControls(this, game);

    var progressMove = 0;
    const movement = (deltaTime) => {

        let speed = gameProps.snakes.speed;
        let progress = deltaTime * speed;
    
        if(~~progress <= ~~progressMove) return;

        snakeControls.currentMovement();

        progressMove = progress != speed ? progress : 0;
        
        this.body.splice(0, 0, nextPos());
        this.increase < 1 ? this.body.pop() : this.increase--;

        io.emit(`snakeUpdate-${id}`, {body: this.body});
        
    }

    const nextPos = () => {

        let direction = directionMap[this.direction],
            axis = Math.abs(direction[1]),
            nextPos = [...this.body[0]];

        nextPos[axis] += direction[axis];

        if(nextPos[axis] >= gameProps.tiles[axis]) nextPos[axis] = 0;
        else if(nextPos[axis] < 0) nextPos[axis] = gameProps.tiles[axis] - 1;

        return nextPos;

    }

    this.update = (deltaTime) => {
        if(this.body.length && !this.killed){
            movement(deltaTime);
        }
    }

}

Snake.prototype.newBody = function(){

    var bodyStart = this.bodyStart,
        from = [bodyStart[0], bodyStart[1]],
        to = bodyStart[2];

    this.body = [from];

    var initialSize = gameProps.snakes.initialSize;
    for (let i = 1; i < initialSize; i++) {

        this.body.push([]);

        let newPos = [...from];

        switch(to){

            case 'right':
            case 'left':
                newPos[0] = to == 'right' ? from[0]+i : from[0]-i;
                break;

            case 'up':
            case 'down':
                newPos[1] = to == 'down' ? from[1]+i : from[1]-i;
                break;

        }

        for (let axis = 0; axis <= 1; axis++) {

            if(newPos[axis] < 0) newPos[axis] = gameProps.tiles[axis] - Math.abs(newPos[axis]);
            if(newPos[axis] >= gameProps.tiles[axis]) newPos[axis] = newPos[axis] - gameProps.tiles[axis];
            
            this.body[i].push(newPos[axis]);
            
        }

    }

    io.emit(`snakeUpdate-${this.id}`, {body: this.body});

}
function SnakeControls(snake, game){

    var rowMovements = [];

    eventEmitter.on(`moveTo-${snake.id}`, moveTo => rowMovements.push(moveTo));

    //Set current movement
    this.currentMovement = () => {

        rowMovements = rowMovements.filter(Boolean);

        if(!rowMovements.length) return;
        snake.direction = rowMovements[0];
        rowMovements && rowMovements.splice(0, 1);

    }

}

var game = new Game();

io.on('connection', socket => {

    var multiplayerLocalAllow = false;

    socket.on('login', data => {

        if(game.playersInTheRoom.length && !multiplayerLocalAllow) return;

        let id = game.playersInTheRoom.length;

        let player = {
            id: socket.id,
            nickname: data.playerNickname,
            

            playerProps: {
                bodyStart: newBodyStart(game.playersInTheRoom.length),
                color: 0
            }
        }

        game.playersInTheRoom.push(player);

        socket.emit('logged', {
            myID: socket.id,
            players: game.playersInTheRoom,
            gameProps: gameProps
        });

        socket.broadcast.emit('newPlayer', game.playersInTheRoom);

        socket.on('changeColor', color => {
            if(color > 0 && color < gameProps.snakes.colors.length){
                player.playerProps.color = color;
                io.emit(`snakeUpdate-${socket.id}`, {color: color});
                io.emit(`playersInTheRoomUpdate`, {i: id, playerProps: {color: color}});
            }
        });

        socket.on('single player', () => {

            io.emit('start');
    
            socket.on('start', () => {
                game.newGame();
    
                socket.on(`moveTo`, moveTo => 
                    eventEmitter.emit(`moveTo-${socket.id}`, moveTo));
            });
            
        });
    
    });

});