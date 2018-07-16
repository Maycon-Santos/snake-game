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
        width: 1024,
        height: 720
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

    var objects = [],
        updates = {};

    const runFunction = (fn, ...args) => {

        var i = objects.length;

        while(i--){
            if(typeof objects[i][fn] == 'function') objects[i][fn](...args);
        }

    }

    const update = (deltaTime) => runFunction('update', deltaTime);

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
    
        io.emit(`foodUpdate-${id}`, {position: this.position, type: this.type});
    }

    this.create();

}
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
var gameProps = {
    tiles: [64, 36], // X, Y

    snakes: {
        speed: 20,
        initialSize: 3,
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
        qnt: 8,

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
                    food.create();
                    game.event.emit('foodEated', food.id);
                }
            });
        })
    }

    this.update = () => {

        if(game.status != 'playing') return;

        if(game.mode == 'deathmatch'){

            snakeColision();

            game.for('players', player => {
                if(player.killed) return;
                player.killed = player.collided; // Kill the player if collided
                if(player.killed) this.deathCounter++;
            });

            if(this.deathCounter >= game.players.length - 1)
                game.status = 'over';

            snakeAteFood();

        }

    }

}
const newBodyStart = id => [5 * (id+1), 5 * (id+1), 'down'];
function Snake(game, props){

    this.id = null;
    this.enhancerId = null;
    this.body = [];

    this.increase = 0;
    this.collided = false;

    this.bodyStart = [0, 0];

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
        set: (to) => {

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

    this.senUpdate = update =>
        game.engine.sendUpdate('players', this.enhancerId, update);

    game.engine.add(this);
    const snakeControls = new SnakeControls(this, game);

    this.newBody();

    if(this.AI) this.AI = new snakeAI(game, this);

    var progressMove = 0;
    const movement = (deltaTime) => {

        let speed = gameProps.snakes.speed;
        let progress = deltaTime * speed;
    
        if(~~progress <= ~~progressMove) return;

        if(this.AI) this.AI.movement();
        else snakeControls.currentMovement();

        progressMove = progress != speed ? progress : 0;
        
        this.body.splice(0, 0, nextPos());
        this.increase < 1 ? this.body.pop() : this.increase--;

        this.senUpdate({body: this.body});
        
    }

    const nextPos = (steps = 1) => {

        let direction = this.directionMap[this.direction],
            axis = Math.abs(direction[1]),
            nextPos = [...this.body[0]];

        nextPos[axis] += direction[axis] * steps;

        if(nextPos[axis] >= gameProps.tiles[axis]) nextPos[axis] = 0;
        else if(nextPos[axis] < 0) nextPos[axis] = gameProps.tiles[axis] - 1;

        return nextPos;

    }

    this.predictMovement = (direction, steps = 1) => {

        var directionNow = this.direction;

        this.direction = direction;

        var _nextPos = nextPos(steps);

        this.direction = directionNow;

        return _nextPos;

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

        /* var lastFood, selectedFood;

        game.for('foods', food => {

            if(!lastFood) return selectedFood = lastFood = food;

            let distance = food.position.sumAll() - snake.head.sumAll(),
                lastFoodDistance = lastFood.position.sumAll() - snake.head.sumAll();

            if(Math.abs(distance) < Math.abs(lastFoodDistance)){
                selectedFood = food;
            }

            lastFood = food;

        });

        return selectedFood; */

        // ============================================

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

    Object.defineProperty(this, 'hazardousAreas', {
        get: () => {

            var areas = [],
                myHead = snake.head;

            game.for('players', player => {

                if(player.killed || player.enhancerId == snake.enhancerId) return;

                game.for(player.body, bodyFragment => {
                    
                    game.for(bodyFragment, (_, axis) => {

                        let otherAxis = Math.abs(axis - 1);

                        if(bodyFragment[axis].isEqual(myHead[axis], myHead[otherAxis] - 1, myHead[otherAxis] + 1)){

                            let distance = myHead[otherAxis] - bodyFragment[otherAxis],
                                distanceABS = Math.abs(distance);

                            if(distanceABS <= 3){

                                let dir = distance / distanceABS,
                                    direction = snake.directionMap[-(dir) * (otherAxis + 1)];

                                areas.push(direction);

                            }
                            
                        }

                    })

                });

            });

            return areas;

        }
    });

    Object.defineProperty(this, 'movementsByPriority', {
        get: () => {

            let movements = ['left', 'right', 'up', 'down'],
                movementsByPriority = [],
                head = snake.head,
                hazardousAreas = this.hazardousAreas;

            game.for(food.position, (pos, axis) => {

                let movIndex = axis;

                if(pos > head[axis]) movIndex++;

                let movement = movements.splice(movIndex, 1)[0];

                if(hazardousAreas.includes(movement) || pos == head[axis])
                    movements.push(movement);
                else
                    movementsByPriority.push(movement);

            });

            if(preferredAxis == undefined)
                preferredAxis = Math.round(Math.random());

            let snakeDirection = snake.direction;

            if((snakeDirection == 'right' && movementsByPriority[0] == 'left')
               || (snakeDirection == 'left' && movementsByPriority[0] == 'right')
               || (snakeDirection == 'up' && movementsByPriority[0] == 'down')
               || (snakeDirection == 'down' && movementsByPriority[0] == 'up'))
                    movementsByPriority.reverse();

            if(preferredAxis == 1) movementsByPriority.reverse();

            return [...movementsByPriority, ...movements.shuffle()];

        }
    });

    this.movement = () => {

        let movements = this.movementsByPriority,
            hazardousAreas = this.hazardousAreas,
            verticesDirections = snake.verticesDirections;

        let selectedMovement;

        for(let i = 0, L = movements.length; i < L; i++){
            const movement = movements[i];

            if(!movement) continue;
            
            if(!hazardousAreas.includes(movement) && !verticesDirections.includes(movement)){
                selectedMovement = movement;
                break;
            }

        }

        snake.direction = selectedMovement;

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
            game.roomCreator = undefined;
            game.playersInTheRoom.length = 0;
            game.clear();
            io.emit('multiplayer-local deny');
        }
    });

    socket.on('login', data => {

        if(game.roomCreator != socket.id && !game.multiplayerLocalAllow)
            return socket.emit('multiplayer disabled');

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
        socket.broadcast.emit('newPlayer', player);

        socket.on('disconnect', () => {
            if(socket.id != game.roomCreator){
                delete game.playersInTheRoom[enhancerId];
                game.playersInTheRoom = game.playersInTheRoom.filter(Boolean);
                io.emit('delete player', enhancerId);
            }
        });

        socket.on('change color', color => {

            let colorsInUse = game.colorsInUse;
            if(colorsInUse.includes(color)) return;

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

            if(game.colorsInUse.includes(data.color)) return;

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