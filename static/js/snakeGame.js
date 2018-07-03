function Engine(game){

    var canvas = game.ctx.canvas;

    var objects = [];

    const runFunction = (fn, ...args) => {

        var i = objects.length;

        while(i--){
            if(typeof objects[i][fn] == 'function') objects[i][fn](...args);
        }

    }

    const draw = () => {
        game.ctx.clearRect(0, 0, canvas.width, canvas.height);
        runFunction('draw');
    }


    this.run = () => {

        let engine = this,
            start = performance.now();

        requestAnimationFrame(function run(timestamp){

            let deltaTime = (timestamp - start) / 1000;
            deltaTime = Math.min(1, deltaTime);

            draw();

            if(deltaTime >= 1) return engine.run();
            requestAnimationFrame(run);

        }.bind(this));

    }

    this.add = (object) => {
        objects.push(object);
        
        object.update = _object => {
            for (const key in _object) object[key] = _object[key];
        }
    }

    this.clear = () => objects = [];

}
function Food(game, id){

    this.id = id;
    this.type;

    this.position = [];

    game.engine.add(this);

    game.socket.on(`foodUpdate-${id}`, this.update);

    this.draw = () => {

        if(game.status != 'playing' || !this.type) return;

        game.ctx.fillStyle = this.type.color;

        game.ctx.beginPath();

        game.ctx.arc(
            this.position[0] * game.tileSize + game.tileSize / 2,
            this.position[1] * game.tileSize + game.tileSize / 2,
            game.tileSize / 2,
            0,
            Math.PI * 2
        );
        
        game.ctx.closePath();

        game.ctx.fill();

    }

}
function Game(canvas){

    // Properties
    var tileSize;
    Object.defineProperty(this, 'tileSize', {
        set: function(val){
            if(+val) tileSize = Math.floor(+val);
            else return console.error('Invalid value');
            canvas.width = this.tileSize * gameProps.tiles[0];
            canvas.height = this.tileSize * gameProps.tiles[1];
            canvas.style.backgroundSize = `${this.tileSize}px ${this.tileSize}px`;
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
                if(!killed) winner = player;
            });

            return winner;
            
        }
    });

    this.playersInTheRoom = [];

    this.id = null;
    this.players = [];
    this.foods = [];

    this.status = 'toStart';
    this.engine = new Engine(this);
    this.interface = new Interface(this);
    this.socket = io();

    this.multiplayerLocalAllow = false;

    this.socket.on('teste', t => console.log(t))

    gestureViewer(this);

    this.engine.run();

}

Game.prototype.newGame = function(){

    this.interface.closeModal();
    this.clear();

    this.addPlayers();
    this.addFoods();

    this.status = "playing";

}

Game.prototype.clear = function(){
    this.players = [];
    this.foods = [];
    this.engine.clear();
}

Game.prototype.for = function(object, fn){
    for (let id = this[object].length-1; id >= 0; id--)
        fn(this[object][id], id);
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
        
        this.newGame();

    });

    game.socket.on('game over', () =>{

        this.interface.gameOver();

        // this.socket.off('game over');

        // var winner = game.winner
        //     ? `<span style="color: ${gameProps.snakes.colors[game.winner.color]}">${game.winner.nickname}</span>`
        //     : 'Nobody';

        // this.dialogBox.alert('Game over', `${winner} is the winner!`, () => {
        //     game.status = 'toStart';
        //     this.open('multiplayer-local-menu');
        // });

    });

    this.socket.on('newPlayer', player => {
        this.playersInTheRoom.push(player);
        this.interface.listPlayersInTheRoom();
    });

    this.socket.on('prepare multiplayer', arr => {

        for (let i = arr.length - 1; i >= 0; i--) {
            const player = arr[i];
            this.playersInTheRoom.push(player);
        }

        this.socket.emit('start');

    });

    this.socket.on('playersInTheRoom update', data => {
        var i = data.i;
        delete data.i;
        this.playersInTheRoom[i] = Object.assign(this.playersInTheRoom[i], data);  
        game.interface.listPlayersInTheRoom();      
    });

    this.socket.on('delPlayer', i => {
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

    this.socket.on('multiplayer-local-address', this.interface.openMultiplayerLocal);

}
var gameProps = {}
function gestureViewer(game){

    var $gestureViewer = document.querySelector('#gestureViewer'),
        $canvas = document.createElement('canvas'),
        ctx = $canvas.getContext('2d');

    $gestureViewer.appendChild($canvas);

    var ballPoints = {};
    var counter = 0;

    const drawLine = (x0, y0, x1, y1) => {
        ctx.strokeStyle = "#7da278";
        ctx.lineCap = "round";
	    ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
    }

    window.addEventListener('touchstart', e => {
        if(game.status != 'playing') return;

        for(let i = e.changedTouches.length - 1; i >= 0; i--){
            const touch = e.changedTouches[i];
            var ballPoint = {
                x: touch.pageX,
                y: touch.pageY
            }
            ballPoints[touch.identifier || ++counter] = ballPoint;
            drawLine(ballPoint.x - 1, ballPoint.y, ballPoint.x, ballPoint.y);
        }
    });

    window.addEventListener('touchmove', e => {
        if(game.status != 'playing') return;

        for(let i = e.changedTouches.length - 1; i >= 0; i--){
            const touch = e.changedTouches[i];
            var ballPoint = ballPoints[touch.identifier || counter],
                x = touch.pageX, y = touch.pageY;

            drawLine(ballPoint.x, ballPoint.y, x, y);
            ballPoint.x = x;
            ballPoint.y = y;
        }
    });

    window.addEventListener('touchend', e => {
        if(game.status != 'playing') return;
        
        for(let i = e.changedTouches.length - 1; i >= 0; i--){
            const touch = e.changedTouches[i];
            delete ballPoints[touch.identifier || counter];
        }
        setTimeout(() => ctx.clearRect(0, 0, $canvas.width, $canvas.height), 200);
    });

    document.ontouchmove = function(e){ e.preventDefault(); } // Disable page scroll

    const canvasFullSize = () => {
        $canvas.width = window.innerWidth;
        $canvas.height = window.innerHeight;
    }

    canvasFullSize();
    window.addEventListener('resize', canvasFullSize);
}
window.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
window.isLumia = /Lumia/i.test(navigator.userAgent);
window.isElectron = /Electron/i.test(navigator.userAgent);
function Interface(game){

    var $interface = document.querySelector('#interface'),
        $modal = $interface.querySelector('.modal'),
        $loginForm = $interface.querySelector('#login form'),
        $inputNickname = $loginForm.querySelector('[name="player_name"]'),
        
        $submitChooser = document.querySelector('#after-login .submit'),

        $mainMenu = $interface.querySelector('#main-menu'),
        $singlePlayer = $mainMenu.querySelector('#single-player'),
        $multiplayer = $mainMenu.querySelector('#multiplayer'),

        $multiplayerMenu = $interface.querySelector('#multiplayer-menu'),
        $multiplayerSubmit = $multiplayerMenu.querySelector('.submit'),
        $player2Name = $multiplayerMenu.querySelector('[name="player_name"]'),
        $playersQtn = $multiplayerMenu.querySelector('.input-number'),
        
        $multiplayerLocal = $interface.querySelector('#multiplayer-local'),
        $multiplayerLocalMenu = $interface.querySelector('#multiplayer-local-menu'),
        $connectedPlayers = $interface.querySelectorAll('.connected-players ul'),
        $multiplayerLocalMenuSubmit = $multiplayerLocalMenu.querySelector('.submit'),
        $playerCounter = $multiplayerLocalMenu.querySelector('.player-counter span'),
        $address = $multiplayerLocalMenu.querySelector('.address'),
        
        $gameOver = $interface.querySelector('#game-over'),
        $gameOverText = $gameOver.querySelector('h2 span'),
        $gameOverSubmit = $gameOver.querySelector('.submit');

    this.dialogBox = new DialogBox($interface);
    const snakeChooser = new SnakeChooser($interface);
    new InputNumber();
    
    this.closeModal = () => $modal.classList.add('closed');
    this.open = what => $interface.className = what;

    this.listPlayersInTheRoom = () => {
        for (let i = $connectedPlayers.length - 1; i >= 0; i--) {
            const $_connectedPlayers = $connectedPlayers[i];

            let playersInTheRoomLength = game.playersInTheRoom.length;
            let lis = '';

            for (let j = 0; j < playersInTheRoomLength; j++) {
                const playerInTheRoom = game.playersInTheRoom[j];
                lis += `<li>
                            <span
                                style="color: ${gameProps.snakes.colors[playerInTheRoom.color]};">
                                ${playerInTheRoom.nickname}
                            </span>
                            <div class="snake"
                                style="background: ${gameProps.snakes.colors[playerInTheRoom.color]};
                                width: ${game.tileSize}px; height: ${game.tileSize}px;">
                            </div>
                        </li>`;
            }

            $_connectedPlayers.innerHTML = lis;
            $playerCounter.innerText = playersInTheRoomLength != 0 ? playersInTheRoomLength : 'o';

        }
    }

    this.gameOver = () => {

        $gameOverText.style.color = gameProps.snakes.colors[game.winner.color] || '';
        $gameOverText.innerText = game.winner.nickname || 'Nobody';

        this.open('game-over');

    }

    var $welcomeText = $mainMenu.querySelector('#welcome');
    $loginForm.addEventListener('submit', e => {
        game.login($inputNickname.value, data => {

            $welcomeText.innerHTML = `Hi, ${$inputNickname.value}`;
            snakeChooser.changeSnakeColor();
            this.open('after-login');

        });
    });

    $singlePlayer.addEventListener('click', e => {
        game.socket.emit('start');
    });

    $submitChooser.addEventListener('click', () => {

        var colorsInUse = game.colorsInUse;
        if(colorsInUse.includes(snakeChooser.currentColor))
            return this.dialogBox.alert('Denied', 'This color is being used.');

        game.socket.emit('changeColor', snakeChooser.currentColor);

        if(game.multiplayerLocalAllow){
            this.listPlayersInTheRoom();
            $multiplayerLocalMenu.className = 'multiplayer-local-viewer';
            $multiplayerLocalMenu
                .querySelector('h4')
                .innerText = 'Waiting to play ...';
            this.open('multiplayer-local-menu');
        }else
            this.open('main-menu');

    });

    $multiplayer.addEventListener('click', () => {

        snakeChooser.currentColor = 0;
        snakeChooser.changeSnakeColor();
        this.open('multiplayer-menu');

    });

    $multiplayerSubmit.addEventListener('click', () => {

        var colorsInUse = game.colorsInUse;
        if(colorsInUse.includes(snakeChooser.currentColor))
            return this.dialogBox.alert('Denied', 'This color is being used.');

        game.socket.emit('prepare multiplayer', {
            nickname: $player2Name.value,
            color: snakeChooser.currentColor,
            nPlayers: $playersQtn.getAttribute('data-value')
        });

    });

    $multiplayerLocal.addEventListener('click', () => {

        game.multiplayerLocalAllow = true;
        game.socket.emit('multiplayer-local-allow');

    });

    this.openMultiplayerLocal = adress => {
        $address.innerText = adress;
        this.open('multiplayer-local-menu');
    }

    $multiplayerLocalMenuSubmit.addEventListener('click', () => {
        
        game.socket.emit('start');

    });

}
function Snake(game, props){

    this.id = null;
    this.idLocal = null;
    this.enhancerId = null;
    this.nickname = null;
    this.body = [];
    this.color = 0;
    this.bodyStart = [0, 0];
    this.killed = false;

    this.merge(props);

    if(this.idLocal == 0) this.touchArea = 'all';

    if(this.idLocal == 1){
        game.players[0].touchArea = 'right';
        this.touchArea = 'left';
    }

    game.engine.add(this);

    if(!isNaN(this.idLocal)) new SnakeControls(this, game);

    this.draw = () => {

        if(this.killed) return;

        game.ctx.fillStyle = gameProps.snakes.colors[this.color];

        this.body.forEach(bodyFragment => {
            game.ctx.fillRect(
                bodyFragment[0] * game.tileSize,
                bodyFragment[1] * game.tileSize,
                game.tileSize,
                game.tileSize
            );
        });

    }

}
function SnakeControls(snake, game){

    const pushMovement = moveTo => {
        if(!moveTo) return;
        game.socket.emit('moveTo', {
            id: snake.id,
            moveTo: moveTo
        });
    }

    var $touchAreas = document.querySelector('#touch-areas');
    var $touchArea = {left: $touchAreas.querySelector('#left'), right: $touchAreas.querySelector('#right')};

    // Keyboard
    var keyMap = (map => map ? {

        directions: Object.keys(map),
        keys: Object.keys(map).map(k => map[k]),

        direction: function(key){
            return this.directions[ this.keys.indexOf(key) ];
        }

    } : undefined)(gameProps.snakes.keyMaps[snake.idLocal]);

    keyMap && window.addEventListener('keydown', e => pushMovement(keyMap.direction(e.key)));

    // Touch devices 
    let touchstart = {}, touchmove = {}, sensibilityTouch = gameProps.snakes.sensibilityTouch;
    const directions = [["left", "right"], ["up", "down"]];
    const orientationMap = {0: "portrait-primary", 180: "portrait-secondary", 90: "landscape-primary", "-90": "landscape-secondary"};

    const getOrientation = () => screen.msOrientation || (screen.orientation || screen.mozOrientation || {}).type || orientationMap[window.orientation];
    let orientation = getOrientation();
    window.addEventListener('orientationchange', () => orientation = getOrientation());
    
    const touchHandle = touchedArea => {

        let dragged = [[], []].map((_, axis) => touchstart[touchedArea][axis] - touchmove[touchedArea][axis]);

        if(isLumia){
            if(orientation === "landscape-primary") dragged[0] = -dragged[0];
            else if(orientation === "landscape-secondary") dragged[1] = -dragged[1];
            if(orientation.indexOf('landscape') > -1) dragged.reverse();

            if(orientation === "portrait-secondary"){
                dragged[0] = -dragged[0];
                dragged[1] = -dragged[1];
            }
        }

        if(touchedArea != snake.touchArea && snake.touchArea != 'all') return;

        let touchAxis = +(Math.abs(dragged[0]) < Math.abs(dragged[1])),
            moveIndex = +(dragged[touchAxis] < 0),
            direction = directions[touchAxis][moveIndex];

        if(Math.abs(dragged[touchAxis]) >= sensibilityTouch){
            if(direction != snake.direction) pushMovement(direction);
            touchstart[touchedArea] = [...touchmove[touchedArea]];
        }

    }

    const touchPos = e => [e.changedTouches[0].pageX, e.changedTouches[0].pageY];

    if(snake.touchArea){
        const $touchAreaKeys = Object.keys($touchArea);
        for (let i = $touchAreaKeys.length - 1; i >=0 ; i--) {
            const area = $touchAreaKeys[i];
            $touchArea[area].addEventListener('touchstart', e => touchstart[area] = touchPos(e));
            $touchArea[area].addEventListener('touchmove', e => { touchmove[area] = touchPos(e); touchHandle(area); });
        }
    }

}
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
Object.prototype.merge = function(object){
    for (const key in object) this[key] = object[key];
}
function DialogBox($interface){

    this.alert = (title, text, callback) => {

        let $modal = $interface.querySelector('.modal');

        let $alert = document.createElement('div');
        $alert.classList.add('dialog-box', 'alert');

        $alert.innerHTML = `<h1>${title}</h1>
                           <p>${text}</p>
                           <button>Ok</button>`;

        let $buttonOk = $alert.querySelector('button');

        $interface.insertBefore($alert, $modal);

        $buttonOk.focus();
        $buttonOk.addEventListener('click', () => {
            $buttonOk.parentNode.remove();
            typeof callback == 'function' && callback();
        });

    }

}
function InputNumber(){
    var $inputsNumber = document.querySelectorAll('.input-number');

    for (let i = $inputsNumber.length - 1; i >= 0; i--) {
        const $inputNumber = $inputsNumber[i];
        
        let $input = $inputNumber.querySelector('span'),
            $decrementButton = $inputNumber.querySelector('.decrement'),
            $incrementButton = $inputNumber.querySelector('.increment');

        $decrementButton.addEventListener('click', () => {

            let value = +$inputNumber.getAttribute('data-value'),
                min = $inputNumber.getAttribute('data-min') || -Infinity;

            if(value > min){
                value--;
                $input.innerHTML = (value == 0) ? 'o' : value;
                $inputNumber.setAttribute('data-value', value);
            }

        });

        $incrementButton.addEventListener('click', () => {

            let value = +$inputNumber.getAttribute('data-value'),
                max = $inputNumber.getAttribute('data-max') || Infinity;

            if(value < max){
                value++;
                $input.innerHTML = (value == 0) ? 'o' : value;
                $inputNumber.setAttribute('data-value', value);
            }

        });

    }
}
function SnakeChooser($interface){

    var $snakeChoosers = $interface.querySelectorAll('.snake-chooser');

    this.currentColor = 0;

    this.changeSnakeColor = () => {

        var colorsInUse = game.colorsInUse;

        for (let i = $snakeChoosers.length - 1; i >= 0; i--) {
            const $snakeChooser = $snakeChoosers[i];
            
            let $chooserPrev = $snakeChooser.querySelector('.chooser-prev'),
                $chooserNext = $snakeChooser.querySelector('.chooser-next'),
                $snake = $snakeChooser.querySelector('.snake');

            $chooserPrev.classList.remove('disabled');
            $chooserNext.classList.remove('disabled');

            if(colorsInUse.includes(this.currentColor))
                $snake.classList.add('color-in-use');
            else
                $snake.classList.remove('color-in-use');

            if(this.currentColor == 0)
                $chooserPrev.classList.add('disabled');

            if(this.currentColor == gameProps.snakes.colors.length - 1)
                $chooserNext.classList.add('disabled');

            $snake.style.background = gameProps.snakes.colors[this.currentColor];
        }
    }

    for (let i = $snakeChoosers.length - 1; i >= 0; i--) {
        const $snakeChooser = $snakeChoosers[i];
        
        let $chooserPrev = $snakeChooser.querySelector('.chooser-prev'),
            $chooserNext = $snakeChooser.querySelector('.chooser-next');

        $chooserPrev.addEventListener('click', e => {
            if(e.target.className.indexOf('disabled') == -1){
                this.currentColor--;
                this.changeSnakeColor();
            }
        });

        $chooserNext.addEventListener('click', e => {
            if(e.target.className.indexOf('disabled') == -1){
                this.currentColor++;
                this.changeSnakeColor();
            }
        });

    }

}
if('serviceWorker' in navigator && !isElectron){
    navigator.serviceWorker.register('serviceWorker.js')
        .then(() => console.log('Service worker funcionando'))
        .catch(() => console.log('Erro ao instalar service worker'));
}