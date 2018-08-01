function Engine(game){

    var $canvas = game.ctx.canvas;

    // Elements to render
    var objects = [];

    this.draw = () => {

        // Clear the canvas
        game.ctx.clearRect(0, 0, $canvas.width, $canvas.height);

        var i = objects.length;

        while(i--){
            // Draw/Render elements
            if(typeof objects[i]['draw'] == 'function') objects[i]['draw']();
        }

    }

    this.add = object => {

        objects.push(object);
                
        object.update = _object => {
            for (const key in _object) object[key] = _object[key];
            requestAnimationFrame(this.draw);
        }
        
    }

    this.clear = () => objects = [];

}
function Food(game, id){

    this.id = id;

    this.color;

    // Previous position (used to compare and know when the current position is changed)
    var prevPosition = [];

    // Position of the food
    this.position = [];

    game.engine.add(this);

    // Render
    this.draw = () => {

        // Checks if food position has changed
        if(!this.position.isEqual(prevPosition)){
            // Play sound of eating
            game.sounds.ate.play;
            prevPosition = [...this.position];
        }

        // If don't have color stop now
        if(!this.color) return;

        game.ctx.fillStyle = this.color;

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
/**
 * Main class that starts the game
 * It receives as parameter the canvas that goes the whole game
 *
 * @param {*} $canvas
 */
function Game($canvas){

    // Define properties
    var tileSize;
    var status;
    var $game = $canvas.parentNode;
    var mute = localStorage.getItem("mute") == 'true';

    Object.defineProperties(this, {

        // ID of socket
        id: { writable: true },

        time: { value: 0, writable: true },

        // Will receive the winner at the end of the game
        winner: { writable: true },

        // Stores the players before sending for the engine to process
        playersInTheRoom: { value: [], writable: false },

        // Players to be processed by engine
        players: { value: [], writable: false },

        // Foods to be processed by the engine
        foods: { value: [], writable: false },

        multiplayerLocalAllow: { value: false, writable: true },

        socket: { value: io(), writable: false },

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

        // Status of the game
        status: {

            set: newStatus => {
                if(newStatus == 'game-over') this.sounds.gameOver.play;
                $game.className = status = newStatus;
            },

            get: () => status

        },

        // Get the winner of the match
        colorsInUse: {

            get: () => {

                var colorsInUse = [];

                this.for('playersInTheRoom', player =>
                    colorsInUse.push(player.color));

                return colorsInUse;

            }

        },

        // Sound of the game
        mute: {
            
            set: Bool => {

                mute = !!Bool;
                localStorage.setItem('mute', mute);
                this.interface.audioToggle(mute);

            },

            get: () => mute

        }

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

    this.socket.on('is playing', () =>
        this.interface.dialogBox.alert('Danied', 'The game is already happening. Try again later.'));

    this.socket.on('teste', t => console.log(t));

    this.interface.audioToggle(mute);
    gestureViewer(this);

}

Game.prototype.start = function(){

    this.interface.hideModal();
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

    this.foods.push(new Food(this, this.foods.length));

    if(this.foods.length < gameProps.foods.qnt)
        this.addFoods();

}

Game.prototype.resizeCanvas = function(){


    var $snakes = document.querySelectorAll('.snake-chooser .snake');
    const chooseSnakeSize = () => {
        for (let i = $snakes.length - 1; i >= 0; i--) {
            $snakes[i].style.width = `${this.tileSize}px`;
            $snakes[i].style.height = `${this.tileSize}px`;
        }
    }

    const resizeCanvas = () => {
       
        let winSize = [window.innerWidth, window.innerHeight]; // X, Y
        let tileSize = [0, 0].map((_, i) => winSize[i] / gameProps.tiles[i]);
        this.tileSize = tileSize[tileSize[0] > tileSize[1] ? 1 : 0];

        chooseSnakeSize();
        
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

        this.playersInTheRoom.push(...data.playersInTheRoom, data.player);
    
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

    this.socket.on('new player', player => {
        this.playersInTheRoom.push(player);
        this.interface.listPlayersInTheRoom();
    });

    this.socket.on('color in use', () =>
        this.interface.dialogBox.alert('Denied', 'This color is being used.'));

    this.socket.on('prepare game', arr => {

        this.playersInTheRoom.push(...arr);
        this.socket.emit('start');

    });

    this.socket.on('playersInTheRoom update', data => {
        var i = data.i;
        delete data.i;
        this.playersInTheRoom[i].merge(data);
        game.interface.listPlayersInTheRoom();
    });

    this.socket.on('delete player', i => {
        this.playersInTheRoom.splice(i, 1);
        this.interface.listPlayersInTheRoom();
    });

    this.socket.on('update', updates => {

        this.for(Object.keys(updates), key => {

            this.for(updates[key], (update, i) => {

                if(update){

                    this.for(Object.keys(update), key2 =>
                        this[key][i][key2] = update[key2]);

                }

            });

            this.engine.draw();

        });

    });

    this.socket.on('multiplayer-local address', this.interface.openMultiplayerLocal);

    this.socket.on('multiplayer-local deny', () => {

        this.playersInTheRoom.clear();
        this.clear();
        this.interface.show('login');

        this.socket.emit('logout');

        this.interface.dialogBox.alert('Danied', 'Local multiplayer disabled.', () => location.reload());

    });

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

    const $ = (path, path2) => {

        var get;

        if(path2) get = path.querySelectorAll(path2); // Get in path (Element)
        else get = document.querySelectorAll(path); // Get in document

        return get.length > 1 ? get : get[0];

    }

    // Get elements of the DOM
    const $interface     = $('#interface'),
          $modal         = $($interface, '.modal'),
          $loginForm     = $($interface, '#login form'),
          $inputNickname = $($loginForm, '[name="player_name"]');
        
    const $submitChooser = $('#after-login .submit');

    const $mainMenu         = $($interface, '#main-menu'),
          $welcomeText      = $($mainMenu, '#welcome'),
          $singlePlayer     = $($mainMenu, '#single-player'),
          $multiplayer      = $($mainMenu, '#multiplayer'),
          $multiplayerLocal = $($mainMenu, '#multiplayer-local'),
          $tutorial         = $($mainMenu, '#tutorial');

    const $singlePlayerMenu        = $($interface, '#single-player-menu'),
          $singlePlayerSubmit      = $($singlePlayerMenu, '.submit'),
          $singlePlayer_playersQtn = $($singlePlayerMenu, '.input-number'),
          $backSinglePlayerMenu    = $($singlePlayerMenu, '.back');

    const $multiplayerMenu        = $($interface, '#multiplayer-menu'),
          $multiplayerSubmit      = $($multiplayerMenu, '.submit'),
          $player2Name            = $($multiplayerMenu, '[name="player_name"]'),
          $multiplayer_playersQtn = $($multiplayerMenu, '.input-number'),
          $backMultiplayerMenu    = $($multiplayerMenu, '.back');
        
    const $multiplayerLocalMenu       = $($interface, '#multiplayer-local-menu'),
          $connectedPlayers           = $($interface, '.connected-players ul'),
          $multiplayerLocalMenuSubmit = $($multiplayerLocalMenu, '.submit'),
          $playerCounter              = $($multiplayerLocalMenu, '.player-counter span'),
          $address                    = $($multiplayerLocalMenu, '.address'),
          $backMultiplayerLocalMenu   = $($multiplayerLocalMenu, '.back');
    
    const $tutorialScreen = $('#tutorial-screen'),
          $tutorialBack = $($tutorialScreen, '.back');
    
    const $gameOver       = $($interface, '#game-over'),
          $gameOverText   = $($gameOver, 'h2 span'),
          $gameOverSubmit = $($gameOver, '.submit');
        
    const $nameOfPlayers = $($interface, '#name-of-players ul');

    const $audioToggle = $('#audio-toggle');

    const $label = $($interface, '#label')

    const snakeColor = color => gameProps.snakes.colors[color];

    this.dialogBox     = new DialogBox($interface);
    const snakeChooser = new SnakeChooser($interface);

    new InputNumber();

    // Get last nickname logged
    if(localStorage.getItem('lastNickname'))
        $inputNickname.value = localStorage.getItem('lastNickname');

    $inputNickname.focus();

    this.showModal = () => $modal.classList.remove('closed');
    this.hideModal = () => $modal.classList.add('closed');
    this.show = what => $interface.className = what;

    // List the players who entered the room (before the game starts)
    this.listPlayersInTheRoom = () => {

        let lis = '';

        game.for('playersInTheRoom', player => {
            lis += `<li>
                        <span
                            style="color: ${snakeColor(player.color)};">
                            ${player.nickname}
                        </span>
                        <div class="snake"
                            style="background: ${snakeColor(player.color)};
                            width: ${game.tileSize}px; height: ${game.tileSize}px;">
                        </div>
                    </li>`;
        });

        $connectedPlayers.innerHTML = lis;
        $playerCounter.innerText = game.playersInTheRoom.length;

    }

    // List players in game (After start)
    this.listPlayersInGame = () => {
        
        let li = '';

        game.for('players', player =>
            li += `<li class="${player.killed ? 'dead' : ''}" style="color: ${snakeColor(player.color)};">${player.nickname}</li>`);

        $nameOfPlayers.innerHTML = li;

    }

    // Show the game-over screen
    this.gameOver = () => {

        $gameOverText.style.color = game.winner ? snakeColor(game.winner.color) : 'inherit';
        $gameOverText.innerText = game.winner ? game.winner.nickname : 'Nobody';

        this.show('game-over');

    }

    /**
     * Standard functions that occur when you click the game over button
     * 
     * @param {*} show : What will be shown after the click
     * @param {*} moreFn : Extra function (Like a callback)
     */
    const gameOverSubmit = (show, moreFn) => {

        $gameOverSubmit.onclick = () => {
            game.status = 'toStart';
            game.clear();
            this.showModal();
            this.show(show);
            game.sounds.menu.play;
            typeof moreFn == 'function' && moreFn();
        }

    }

    // Login event
    $loginForm.addEventListener('submit', e => {
        game.login($inputNickname.value, data => {

            $welcomeText.innerHTML = `Hi, ${$inputNickname.value}`;
            snakeChooser.changeSnakeColor();

            this.show('after-login');

            localStorage.setItem('lastNickname', $inputNickname.value);

            game.sounds.enter.play;

        });
    });

    { // Single player
        $singlePlayer.addEventListener('click', e =>
            this.show('single-player-menu'));

        $singlePlayerSubmit.addEventListener('click', () => {

            game.socket.emit('prepare single-player', $singlePlayer_playersQtn.getAttribute('data-value'));
            gameOverSubmit('single-player-menu', () => game.playersInTheRoom.length = 1);

        });

        $backSinglePlayerMenu.addEventListener('click', () => this.show('main-menu'));
    }

    { // Multiplayer

        $multiplayer.addEventListener('click', () => {

            snakeChooser.currentColor = 0;
            snakeChooser.changeSnakeColor();
            this.show('multiplayer-menu');

        });

        $multiplayerSubmit.addEventListener('click', () => {

            game.playersInTheRoom = [game.playersInTheRoom[0]];

            game.socket.emit('prepare multiplayer', {
                nickname: $player2Name.value,
                color: snakeChooser.currentColor,
                nPlayers: $multiplayer_playersQtn.getAttribute('data-value')
            });

            gameOverSubmit('multiplayer-menu', () => game.playersInTheRoom.length = 1);

        });

        $backMultiplayerMenu.addEventListener('click', () => this.show('main-menu'));

    }

    { // Multiplayer-local

        $multiplayerLocal.addEventListener('click', () => {

            game.multiplayerLocalAllow = true;
            game.socket.emit('multiplayer-local allow');
            $multiplayerLocalMenuSubmit.removeAttribute('disabled');

        });

        this.openMultiplayerLocal = adress => {

            $address.innerText = adress;
            this.show('multiplayer-local-menu');

        }

        $multiplayerLocalMenuSubmit.addEventListener('click', () => {
            
            $multiplayerLocalMenuSubmit.setAttribute('disabled', true);
            game.socket.emit('ready');
            
            gameOverSubmit('multiplayer-local-menu', () => $multiplayerLocalMenuSubmit.removeAttribute('disabled'));

        });

        $backMultiplayerLocalMenu.addEventListener('click', () => {

            game.playersInTheRoom.length = 1;
            game.socket.emit('multiplayer-local deny');
            this.show('main-menu');

        });

    }

    $tutorial.addEventListener('click', () => this.show('tutorial-screen'));
    $tutorialBack.addEventListener('click', () => this.show('main-menu'));

    $submitChooser.addEventListener('click', () =>{

        game.socket.emit('change color', snakeChooser.currentColor);

        game.socket.on('color not in use', () => {

            game.socket.off('color not in use');
    
            // if other player enter
            if(game.multiplayerLocalAllow){
    
                this.listPlayersInTheRoom();
                $multiplayerLocalMenu.className = 'multiplayer-local-viewer';
                $($multiplayerLocalMenu, ('h4')).innerText = 'Waiting to play ...';
                this.show('multiplayer-local-menu');
    
            // If room creator enter
            }else this.show('main-menu');
    
        });

    });

    { // Audio

        this.audioToggle = mute => $audioToggle.className = mute ? 'muted' : '';
        $audioToggle.addEventListener('click', () => game.mute = !game.mute);

        // Set sounds
        [$singlePlayer, $multiplayer, $multiplayerLocal, $submitChooser].map($el =>
            $el.addEventListener('click', () => game.sounds.menu.play));

        [$backSinglePlayerMenu, $backMultiplayerMenu, $backMultiplayerLocalMenu].map($el =>
            $el.addEventListener('click', () => game.sounds.back.play));

        [$singlePlayerSubmit, $multiplayerSubmit, $multiplayerLocalMenuSubmit].map($el =>
            $el.addEventListener('click', () => game.sounds.enter.play));

    }

    this.label = (text, type) => {

        const $type = document.createElement(type == 0 ? 'span' : 'strong');

        $type.innerText = text;

        $label.innerHTML = '';
        $label.appendChild($type);

        setTimeout(() => $type.className = 'show', 0);
        setTimeout(() => $type.remove(), 1000);

    }

    game.socket.on('countdown', n => this.label(n, 1));

}
function Snake(game, props){

    this.id = null;

    // Id in relation to the player in the machine itself (0 is player 1, 1 is player 2)
    this.idLocal = null;

    this.enhancerId = null;

    this.nickname = null;

    this.body = [];

    this.color = 0;

    let killed = false;
    Object.defineProperty(this, 'killed', {
        get: () => killed,
        set: Bool => {
            if(killed = Bool){
                game.sounds.died.play;
                game.interface.listPlayersInGame();
            }
        }
    })

    this.merge(props);

    { // Multiplayer

        if(this.idLocal == 0) this.touchArea = 'all';

        if(this.idLocal == 1){
            game.players[0].touchArea = 'right';
            this.touchArea = 'left';
        }
        
    }

    game.engine.add(this);

    // Set controlls
    if(!isNaN(this.idLocal)) new SnakeControls(this, game);

    // Render
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

    // Emit movement to server
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

    // For touch devices 
    let touchstart = {}, touchmove = {}, sensibilityTouch = gameProps.snakes.sensibilityTouch;
    const directions = [["left", "right"], ["up", "down"]];
    const orientationMap = {0: "portrait-primary", 180: "portrait-secondary", 90: "landscape-primary", "-90": "landscape-secondary"};

    const getOrientation = () => screen.msOrientation || (screen.orientation || screen.mozOrientation || {}).type || orientationMap[window.orientation];
    let orientation = getOrientation();
    window.addEventListener('orientationchange', () => orientation = getOrientation());
    
    const touchHandle = touchedArea => {

        let dragged = [[], []].map((_, axis) => touchstart[touchedArea][axis] - touchmove[touchedArea][axis]);

        // Windows phone in landscape -_-
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
            $touchArea[area].addEventListener('touchmove', e => {

                e.preventDefault();

                touchmove[area] = touchPos(e);
                touchHandle(area);

                return false;

            }, { passive: false });
        }
    }

}
function Sounds(game){

    const $canvas = game.ctx.canvas;

    const path = 'sounds';

    const soundMap = {
        menu: 'menu.wav',
        back: 'back.wav',
        prev: 'prev.wav',
        next: 'next.wav',
        died: 'died.wav',
        ate: 'ate.wav',
        enter: 'enter.wav',
        gameOver: 'game-over.wav'
    }

    const addAudioPlayers = (() => {

        const keys = Object.keys(soundMap);
        for (let i = 0, L = keys.length; i < L; i++) {
            const key = keys[i];
            const sound = soundMap[key];

            let audioExtension = sound.split('.').lastItem();

            let $player = document.createElement('audio');
            $player.className = 'sound';
            $player.src = `${path}/${sound}`;
            $player.setAttribute('type', `audio/${audioExtension == 'mp3' ? 'mpeg' : audioExtension}`);

            $canvas.parentNode.insertBefore($player, $canvas);

            this[key] = {};

            Object.defineProperties(this[key], {

                play: {
                    get: () => {
                        if(!game.mute) $player.play();
                    }
                },

                volume: {
                    get: () => $player.volume,
                    set: v => $player.volume = v
                }

            });

        }

    })();

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

Array.prototype.clear = function(){
    this.length = 0;
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

            game.sounds.prev.play;

        });

        $incrementButton.addEventListener('click', () => {

            let value = +$inputNumber.getAttribute('data-value'),
                max = $inputNumber.getAttribute('data-max') || Infinity;

            if(value < max){
                value++;
                $input.innerHTML = (value == 0) ? 'o' : value;
                $inputNumber.setAttribute('data-value', value);
            }

            game.sounds.next.play;

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
                game.sounds.prev.play;
            }
        });

        $chooserNext.addEventListener('click', e => {
            if(e.target.className.indexOf('disabled') == -1){
                this.currentColor++;
                this.changeSnakeColor();
                game.sounds.next.play;
            }
        });

    }

}
if('serviceWorker' in navigator && !isElectron){
    navigator.serviceWorker.register('serviceWorker.js')
        .then(() => console.log('Service worker funcionando'))
        .catch(() => console.log('Erro ao instalar service worker'));
}