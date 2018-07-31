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

Array.prototype.sumAll = function(){
    return this.reduce((total, sum) => total + sum, 0);
}

Array.prototype.lastItem = function(){
    return this[this.length - 1];
}

Array.prototype.includesArr = function(arr){

    for (let i = this.length - 1; i >= 0; i--){
        if(this[i].isEqual(arr)) return true;
    }

}

Array.prototype.shuffle = function(){

    var n = this.length;
    var tempArr = [];

    for ( var i = 0; i < n-1; i++ ) {
        // The following line removes one random element from arr
        // and pushes it onto tempArr
        tempArr.push(this.splice(Math.floor(Math.random()*this.length),1)[0]);
    }

    // Push the remaining item onto tempArr
    tempArr.push(this[0]);
    return tempArr;

}

Array.prototype.clear = function(){
    this.length = 0;
}
Number.prototype.isEqual = function(...values){

    for(let i = 0, L = values.length; i < L; i++){

        if(this == values[i]) return true;

    }

    return false;

}
Object.prototype.merge = function(object){
    for (const key in object)
        this[key] = object[key];
}

const electron = require('electron');
const events = require('events');
const express = require('express');
const app = express();
const internalIp = require('internal-ip');
const server = app.listen(5300);

var game = new Game();

app.use(express.static('static'));

const io = require('socket.io')(server);

var mainWindow;
electron.app.on('ready', () => {

    mainWindow = new electron.BrowserWindow({
        width: 800,
        height: 480,
        // minWidth: 1024,
        // minHeight: 720
    });

    mainWindow.setMenuBarVisibility(false);

    mainWindow.webContents.openDevTools();

    app.use(express.static('static'));
    
    mainWindow.loadURL(`http://localhost:${server.address().port}`);

});

electron.app.on('window-all-closed', () => {
    electron.app.quit();
});
function Engine(){

    // Elements to process
    var objects = [],
    // Elements processed
        updates = {};

    const update = (deltaTime) => {

        var i = objects.length;

        while(i--){
            if(typeof objects[i]['update'] == 'function') objects[i]['update'](deltaTime);
        }

    }

    const sendUpdate = () => {
        if(Object.keys(updates).length){
            io.emit('update', updates);
            updates = {};
        }
    }

    this.run = () => {

        let lastUpdate = Date.now();
        
        const run = () => {

            let now = Date.now();
            let deltaTime = (now - lastUpdate) / 1000;
            deltaTime = Math.min(1, deltaTime);

            if(deltaTime >= 1) lastUpdate = now;

            update(deltaTime);
            sendUpdate();

        };

        setInterval(run, 0);

    }

    this.add = (object) => objects.push(object);

    this.sendUpdate = (object, i, update) => {

        if(!updates[object]) updates[object] = [];
        if(!updates[object][i]) updates[object][i] = {};
        
        updates[object][i] = Object.assign(updates[object][i], update);

    }

    this.clear = () => objects = [];

}
function Food(game, id){

    this.id = id;

    // Receive food types by gameProps
    var foodTypes = [];
    this.type;

    this.position = [];

    game.engine.add(this);

    // Set food types and chance
    for (const key in gameProps.foods.types) {
        const foodType = gameProps.foods.types[key],
              chance = foodType.chance;

        for (let i = 0; i < chance; i++) foodTypes.push(foodType);
    }

    // Function responsible for sending the processed data to the client
    this.senUpdate = update =>
        game.engine.sendUpdate('foods', this.id, update);

    this.create = function(){

        const selectFood = Math.round(Math.random() * (foodTypes.length - 1));

        this.type = foodTypes[selectFood];

        // Generate a new position
        this.position = [[], []].map((_, axis) => Math.round(Math.random() * (gameProps.tiles[axis] - 1)));
    
        this.senUpdate({position: this.position, color: this.type.color});

    }

    this.create();

}
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
var gameProps = {
    tiles: [64, 36], // X, Y

    snakes: {
        speed: 15,
        initialSize: 1,
        initialDirection: "right",
        reverse: false,
        sensibilityTouch: 30, // the higher, the less sensitive

        keyMaps: [
            {left: "ArrowLeft", right: "ArrowRight", up: "ArrowUp", down: "ArrowDown"},
            {left: "a", right: "d", up: "w", down: "s"}
        ],

        colors: [
            '#000000',
            'DimGray',
            'HotPink',
            'Brown',
            'DarkBlue',
            'RosyBrown',
            'Chocolate',
            'AliceBlue',
            'Goldenrod'
        ]
    },

    foods: {
        qnt: 1,

        types: {
            normal: {
                chance: 30,
                color: '#FFE400'
            },

            superSlow: {
                chance: 3,
                color: '#af3907',
                powerup: 'super slow'
            },

            superSpeed: {
                chance: 3,
                color: '#0f8660',
                powerup: 'super speed'
            },

            superIncrease: {
                chance: 3,
                color: '#29002d',
                powerup: 'super increase'
            },
            
            freeze: {
                chance: 0,
                color: '#076f96',
                powerup: 'freeze'
            },

            invisible: {
                chance: 0,
                color: '#a607af'
            }

        }

    }

}
function GameRules(game){

    game.engine.add(this);

    this.deathCounter = 0;

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
    
    }

    const snakeAteFood = () => {
        game.for('foods', food => {
            game.for('players', player => {
                if(player.head.isEqual(food.position)){

                    player.increase++;

                    const powerup = food.type.powerup || null;

                    if(powerup && powerups[powerup])
                        powerups[powerup](player, game);
                        
                    food.create();
                    game.event.emit('foodEated', food.id);

                }
            });
        })
    }

    this.update = () => {

        if(game.status != 'playing') return;

        snakeColision();

        game.for('players', player => {
            if(!player || player.killed) return;
             // Kill the player if collided
            player.killed = player.collided;
        });

        snakeAteFood();

    }

}
const newBodyStart = id =>{

    id++;

    // Reset the "counter" to every 3 numbers (4 = 1, 7 = 1, 8 = 2 ...)
    // Ex: (4 / 3.0001) = 1.3332888903703208
    //     (1.333288... % 1) = 0.333288...
    //     (0.333288... * 3) = 0.99986667...
    //     Math.round(0.99986667...) = 1
    let xMultiplier = Math.round(((id / 3.0001) % 1) * 3),
        yMultiplier = Math.ceil(id / 3);

    io.emit('teste', xMultiplier);

    return [16 * xMultiplier, 9 * yMultiplier, 'down'];

}
const powerups = new function(){

    this.set = (powerupName, func) =>
        this[powerupName] = func;

}
powerups.set('freeze', (snake, game) => {

    game.for('players', player => {

        if(player.enhancerId == snake.enhancerId) return;

        player.freeze += 10;

    });

});
powerups.set('super increase', snake => snake.increase += 5);
powerups.set('super slow', (snake, game) => {

    game.for('players', player => {

        if(player.enhancerId == snake.enhancerId) return;

        player.superSlow += 50;

    });

});
powerups.set('super speed', snake => {
    
    snake.superSpeed += 50;

});
function Snake(game, props){

    // Socket id of the player
    this.id = null;

    this.enhancerId = null;

    this.body = [];

    // Powerups
    this.increase = 0; // Number the snake will grow
    this.superSpeed = 0;
    this.superSlow = 0;
    this.freeze = 0;

    this.collided = false;

    this.bodyStart = [0, 0];

    // If the snake is going to have A.I
    this.AI = false;

    this.merge(props);

    this.directionMap = {
        'left': [-1, 0],
        'right': [1, 0],
        'up': [0, -1],
        'down': [0, 1],

        '-1': 'left',
        1: 'right',
        '-2': 'up',
        2: 'down'
    }

    var direction = gameProps.snakes.initialDirection;
    Object.defineProperty(this, 'direction', {
        get: () => direction,
        set: to => {

            let directions = Object.keys(this.directionMap),
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
            if(Bool != killed){
                killed = !!Bool;

                this.senUpdate({killed: killed});

                if(killed) game.gameRules.take.deathCounter++;

                if(game.gameRules.take.deathCounter >= game.players.length - 1)
                    game.status = 'over';
            }
        }
    });

    Object.defineProperty(this, 'bodyVertices', {
        get: () => {

            var body = [[this.body[0]]],
                prevPos = this.body[0],
                axisEqual;

            for(let i = 1, L = this.body.length; i < L; i++){
                const bodyFragment = this.body[i];

                bodyFragment.map((pos, axis) => {

                    if(pos == prevPos[axis]){
                        if(!axisEqual) axisEqual = axis;
                        else if(axisEqual != axis) {
                            body.push([]);
                            axisEqual = axis;
                        }
                    }

                });

                body.lastItem().push(bodyFragment);

                prevPos = bodyFragment;

            }

            return body;

        }
    });

    Object.defineProperty(this, 'verticesDirections', {
        get: () => {

            let head = this.head,
                body = this.bodyVertices,
                directions = [];

            for(let i = 1, L = body.length; i < L; i++){
                const fragment = body[i];

                loopFragment: for(let j = 0, L2 = fragment.length; j < L2; j++){
                    const pos = fragment[j];

                    for(let axis = 0, L3 = pos.length; axis < L3; axis++){

                        if(head[axis] == pos[axis]){
    
                            let otherAxis = Math.abs(axis - 1);
    
                            if(head[otherAxis] < pos[otherAxis])
                                directions.push(this.directionMap[1 * (otherAxis + 1)]);
                            else
                                directions.push(this.directionMap[-1 * (otherAxis + 1)]);
    
                            break loopFragment;
    
                        }

                    }
                    
                }

            }

            return directions;

        }
    });

    // Function responsible for sending the processed data to the client
    this.senUpdate = update =>
        game.engine.sendUpdate('players', this.enhancerId, update);

    game.engine.add(this);

    // Get movements by controlls of the client
    const snakeControls = new SnakeControls(this, game);

    // Create a new body
    this.newBody();

    // Insert snake A.I
    if(this.AI) this.AI = new snakeAI(game, this);

    var progressed = 0;
    const movement = (deltaTime) => {

        let speed = gameProps.snakes.speed;

        if(this.superSpeed > 0) speed *= 1.4;
        if(this.superSlow > 0) speed *= 0.5;

        let progress = deltaTime * speed;

        if(progressed > progress) progressed = 0;

        if(~~progress <= ~~progressed) return;

        if(this.AI) this.AI.movement();
        else snakeControls.currentMovement();

        progressed = progress >= speed ? 0 : progress;
        
        if(this.freeze <= 0){
            this.body.splice(0, 0, nextPos());
            this.increase < 1 ? this.body.pop() : this.increase--;
        }

        if(this.superSpeed) this.superSpeed--;
        if(this.superSlow) this.superSlow--;
        if(this.freeze) this.freeze--;

        this.senUpdate({body: this.body});
        
    }

    // Get the next player position
    const nextPos = (steps = 1) => {

        let direction = this.directionMap[this.direction],
            axis = Math.abs(direction[1]),
            nextPos = [...this.body[0]];

        nextPos[axis] += direction[axis] * steps;

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

    this.senUpdate({body: this.body});

}
function snakeAI(game, snake){

    var lockDirection = 0,
        preferredAxis;

    const selectFood = () => {

        let foods = game.foods,
            selectedFood = foods[Math.round(Math.random() * (foods.length - 1))];

        return selectedFood;
        
    }

    var food = selectFood();

    game.event.on('foodEated', id => {

        if(food.id == id){
            food = selectFood();
            preferredAxis = undefined;
        }

    });

    const hazardousDirections = () => {
        
        const directions = [],
              enhancerId = snake.enhancerId,
              head = snake.head;
        
        game.for('players', (player, PlayerEnhancerId) =>
            (player.killed || enhancerId == PlayerEnhancerId) ? null :

            game.for(player.body, bodyFrag => game.for(bodyFrag, (_, axis) => {

                const otherAxis = (axis == 1) ? 0 : 1;

                if(!bodyFrag[axis].isEqual(head[axis])) return;

                const distance = head[otherAxis] - bodyFrag[otherAxis],
                      distanceABS = Math.abs(distance);

                if(distanceABS <= 5){

                    const dir = distance / distanceABS,
                          direction = -(dir) * (otherAxis + 1);
                          
                    directions.push(snake.directionMap[direction]);

                }

            }))

        );

        return directions.concat(snake.verticesDirections);
        
    }

    const movimentsToGetFood = () => {

        const movements = ['left', 'right', 'up', 'down'],
              toReturn = [],
              head = snake.head,
              foodPos = food.position,
              dontMoveTo = hazardousDirections();

        game.for(foodPos, (pos, axis) => {

            let movIndex = axis;

            // 1 = right or down
            if(foodPos[axis] > head[axis]) movIndex++;

            // Remove and get movement of the array
            const movement = movements.splice(movIndex, 1)[0];

            // If axis equals 1 the "movements" looks like this: ['left', 'up', 'down']
            // So, if in the next loop the axis equals 2 the movements looks like this: ['left', 'up']
            // These moves should be the last ones the snake will think of doing

            // If it is a dangerous move, you should be the last to think about doing it
            if(dontMoveTo.includes(movement) || foodPos[axis] == head[axis]) movements.push(movement);
            else toReturn.push(movement);

        });

        return toReturn.concat(movements.shuffle());

    }

    const movesToScape = (moves, dontMoveTo) => {

        const toReturn = [];
        
        game.for(moves, move => {

            if(!dontMoveTo.includes(move))
                toReturn.push(move);

        });

        return toReturn;

    }

    const axis = moviment => {
        if(moviment == 'left' || moviment == 'right') return 'horizontal';
        else return 'vertical';
    }

    this.movement = () => {

        let head = snake.head,
            movements = movesToScape(movimentsToGetFood(), hazardousDirections()),
            verticesDirections = snake.verticesDirections;

        if(preferredAxis == undefined)
            preferredAxis = Math.round(Math.random());

        game.for(food.position, (_, axis) => {

            if(food.position[axis] == head[axis] && preferredAxis == axis)
                preferredAxis = (preferredAxis == 1) ? 0 : 1;

        });

        for(let i = 0, L = movements.length; i < L; i++){
            const movement = movements[i];

            if(verticesDirections.includes(movement))
                movements.slice(i, 1);

        }

        if(movements.length >= 2){

            if(axis(movements[preferredAxis]) == snake.direction)
                preferredAxis = (preferredAxis == 1) ? 0 : 1;

            snake.direction = movements[preferredAxis];

        }else if(movements.length == 1)
            snake.direction = movements[0];
        else
            snake.direction = movements[movimentsToGetFood().shuffle()[0]];

    }

}
function SnakeControls(snake, game){

    var rowMovements = [];

    game.event.on('moveTo', (data = {id, moveTo}) => {
        if(data.id == snake.id){
            if(data.moveTo != rowMovements.lastItem())
                rowMovements.push(data.moveTo);
        }
    });

    //Set current movement
    this.currentMovement = () => {

        rowMovements = rowMovements.filter(Boolean);

        if(!rowMovements.length) return;
        snake.direction = rowMovements[0];
        rowMovements && rowMovements.splice(0, 1);

    }

}

io.on('connection', socket => {

    if(!game.roomCreator) game.roomCreator = socket.id;

    socket.on('disconnect', () => {
        if(socket.id == game.roomCreator){
            game.status = 'toStart';
            game.roomCreator = undefined;
            game.playersInTheRoom.length = 0;
            game.clear();
            io.emit('multiplayer-local deny');
        }
    });

    socket.on('login', data => {

        if(game.roomCreator != socket.id && !game.multiplayerLocalAllow)
            return socket.emit('multiplayer disabled');

        if(game.status == 'playing')
            return socket.emit('is playing');

        let enhancerId = game.playersInTheRoom.length;

        let player = {
            id: socket.id,
            enhancerId: enhancerId,
            nickname: data.playerNickname,
            bodyStart: newBodyStart(game.playersInTheRoom.length)
        }

        socket.emit('logged', {
            myID: player.id,
            multiplayerLocal: game.multiplayerLocalAllow,
            player: player,
            playersInTheRoom: game.playersInTheRoom,
            gameProps: gameProps
        });

        game.playersInTheRoom.push(player);
        socket.broadcast.emit('new player', player);

        socket.on('disconnect', () => {
            if(socket.id != game.roomCreator){
                game.playersInTheRoom.splice(enhancerId, 1);
                io.emit('delete player', enhancerId);
                if(game.status == 'playing'){
                    game.players[enhancerId].killed = true;
                }
            }
        });

        socket.on('change color', color => {

            if(game.colorsInUse.includes(color))
                return socket.emit('color in use');
            else socket.emit('color not in use');

            if(color >= 0 && color < gameProps.snakes.colors.length){
                player.color = color;
                io.emit(`playersInTheRoom update`, {i: enhancerId, color: color});
            }

        });

        socket.on('start', () => {

            if(game.playersInTheRoom.length && !game.multiplayerLocalAllow){
                if(game.roomCreator != socket.id) return;
            }

            io.emit('start');
            game.start();

        });

        socket.on('moveTo', data => game.event.emit('moveTo', data));

        socket.on('prepare single-player', nPlayers => {

            if(game.playersInTheRoom.length && game.multiplayerLocalAllow)
                return;

            io.emit('prepare game', game.createPlayers(nPlayers));

        });

        socket.on('prepare multiplayer', data => {

            if(game.playersInTheRoom.length && game.multiplayerLocalAllow)
                return;

            if(game.colorsInUse.includes(data.color))
                return socket.emit('color in use');

            let players = [];

            let player2 = {
                id: `${socket.id}[1]`,
                idLocal: 1,
                enhancerId: game.playersInTheRoom.length,
                nickname: data.nickname || 'Player 2',
                bodyStart: newBodyStart(game.playersInTheRoom.length),
                color: data.color
            }

            game.playersInTheRoom.push(player2);
            players.push(player2);

            players = [...players, ...game.createPlayers(data.nPlayers)];

            io.emit('prepare game', players);
            
        });

        socket.on('multiplayer-local allow', () => {

            if(game.roomCreator != socket.id) return;

            game.multiplayerLocalAllow = true;
            game.readyPlayers = 0;

            socket.on('disconnect', () =>
                game.multiplayerLocalAllow = false);

            socket.emit('multiplayer-local address', `${internalIp.v4.sync()}:${server.address().port}`);

        });

        socket.on('multiplayer-local deny', () => {

            if(game.roomCreator != socket.id) return;

            game.multiplayerLocalAllow = false;

            socket.broadcast.emit('multiplayer-local deny');

        });

        socket.on('ready', () => {

            if(game.readyPlayers < 0) game.readyPlayers = 0;
            game.readyPlayers++;

            if(game.readyPlayers == game.playersInTheRoom.length && game.playersInTheRoom.length > 1){
                io.emit('start');
                game.start();
            }

            socket.on('disconnect', () => game.readyPlayers--);

        });

        socket.on('logout', () => socket.disconnect());
    
    });

});