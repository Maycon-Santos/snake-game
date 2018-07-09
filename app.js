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
Object.prototype.merge = function(object){
    for (const key in object)
        this[key] = object[key];
}

const electron = require('electron');
const events = require('events');
const express = require('express');
const app = express();
const internalIp = require('internal-ip');
const server = app.listen(0);

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
    for (let id = this[object].length-1; id >= 0; id--)
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
        qnt: 2,

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

            let directions = Object.keys(directionMap),
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

            var bodyWithVetexes = [[this.body[0]]],
                prevPos = this.body[0];

            for(let i = 1, L = this.body.length; i < L; i++){
                const bodyFragment = this.body[i];

                if(bodyFragment[0] != prevPos[0] && bodyFragment[1] != prevPos[1]){
                    bodyWithVetexes.push([]);
                }

                bodyWithVetexes.lastItem().push(bodyFragment);

                prevPos = bodyFragment;

            }

            return bodyWithVetexes;

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

        let direction = directionMap[this.direction],
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
        movements = ['left', 'right', 'up', 'down'];

    const selectFood = () => {

        var lastFood, selectedFood;

        game.for('foods', food => {

            if(!lastFood) return selectedFood = lastFood = food;

            let distance = food.position.sumAll() - snake.head.sumAll(),
                lastFoodDistance = lastFood.position.sumAll() - snake.head.sumAll();

            if(Math.abs(distance) < Math.abs(lastFoodDistance)){
                selectedFood = food;
            }

            lastFood = food;

        });

        return selectedFood;

    }

    var food = selectFood();

    game.event.on('foodEated', id => {

        if(food.id == id) food = selectFood();

    });

    this.movement = () => {

        var hazardousAreas = (() => {

            var areas = [];

            game.for('players', (player, id) => {

                var body = [...player.body];

                if(id == snake.enhancerId) body.splice(0, 1);

                areas.push(...body);

            });

            return areas;

        })();

        var movesToGetFood = [['left', 'right'], ['up', 'down']].map((mov, axis) => {
            if(food.position[axis] < snake.head[axis])
                return mov[0];
            else if(food.position[axis] != snake.head[axis])
                return mov[1];
            else
                return null;
        });

        var axis = Math.round(Math.random()),
            selectMovement = movesToGetFood[axis];

        if(hazardousAreas.includesArr(snake.predictMovement(selectMovement))){

            [...movements].shuffle().map(direction => {

                if(!hazardousAreas.includesArr(snake.predictMovement(direction))){
                    selectMovement = direction;
                }

            });

            food = selectFood();

        }

        io.emit('teste', snake.bodyVertices);

        /*
            NÃO TA FUNCIONANDO

            Já tenho o corpo da cobrinha separada em vértices
            Próximo passo: Identificar o vértice que está ao lado dela e evitar que ela vá para essa direção
            Obs: Não deve ser regra absoluta, se não houver saída ela vai pra esse caminho mesmo
        */

        // for (let i = 0; i < 2; i++) {

        //     let sumAxis = Math.round(movements.indexOf(selectMovement) / 3) * 2;
                
        //     if((snake.predictMovement(selectMovement)[i] + 4 == snake.body[2][i]
        //     || snake.predictMovement(selectMovement)[i] - 4 == snake.body[2][i])){

        //         let _movements = [...movements];
        //         delete _movements[_movements.indexOf(selectMovement)];

        //         [..._movements].shuffle().map(direction => {

        //             if(!hazardousAreas.includesArr(snake.predictMovement(direction))){
        //                 selectMovement = direction;
        //             }
    
        //         });

        //     }
            
        // }

        if(selectMovement) snake.direction = selectMovement;

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
            if(game.roomCreator == socket.id){
                game.playersInTheRoom = [];
                game.clear();
                io.emit('multiplayer-local-deny');
            }else{
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
            game.newGame();

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
                game.localhost = true;
                io.emit('start');
                game.newGame();
            }

            socket.on('disconnect', () => game.readyPlayers--);

        });

        socket.on('logout', () => socket.disconnect());
    
    });

});