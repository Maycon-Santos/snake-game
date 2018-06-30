'use strict';
function Engine(game) {
    var _this = this;
    var canvas = game.ctx.canvas;
    var objects = [];
    var runFunction = function runFunction(fn) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }
        var i = objects.length;
        while (i--) {
            var _objects$i;
            if (typeof objects[i][fn] == 'function')
                (_objects$i = objects[i])[fn].apply(_objects$i, args);
        }
    };
    var draw = function draw() {
        game.ctx.clearRect(0, 0, canvas.width, canvas.height);
        runFunction('draw');
    };
    this.run = function () {
        var engine = _this, start = performance.now();
        requestAnimationFrame(function run(timestamp) {
            var deltaTime = (timestamp - start) / 1000;
            deltaTime = Math.min(1, deltaTime);
            draw();
            if (deltaTime >= 1)
                return engine.run();
            requestAnimationFrame(run);
        }.bind(_this));
    };
    this.add = function (object) {
        objects.push(object);
        object.update = function (_object) {
            for (var key in _object) {
                object[key] = _object[key];
            }
        };
    };
}
function Food(game, id) {
    var _this = this;
    this.id = id;
    this.type;
    this.position = [];
    game.engine.add(this);
    game.socket.on('foodUpdate-' + id, this.update);
    this.draw = function () {
        if (game.status != 'playing' || !_this.type)
            return;
        game.ctx.fillStyle = _this.type.color;
        game.ctx.beginPath();
        game.ctx.arc(_this.position[0] * game.tileSize + game.tileSize / 2, _this.position[1] * game.tileSize + game.tileSize / 2, game.tileSize / 2, 0, Math.PI * 2);
        game.ctx.closePath();
        game.ctx.fill();
    };
}
function Game(canvas) {
    var _this = this;
    // Properties
    var tileSize;
    Object.defineProperty(this, 'tileSize', {
        set: function set(val) {
            if (+val)
                tileSize = Math.floor(+val);
            else
                return console.error('Invalid value');
            canvas.width = this.tileSize * gameProps.tiles[0];
            canvas.height = this.tileSize * gameProps.tiles[1];
        },
        get: function get() {
            return tileSize;
        }
    });
    Object.defineProperty(this, 'ctx', {
        value: canvas.getContext('2d'),
        writable: false
    });
    var status, $game = canvas.parentNode;
    Object.defineProperty(this, 'status', {
        set: function set(newStatus) {
            return $game.className = status = newStatus;
        },
        get: function get() {
            return status;
        }
    });
    Object.defineProperty(this, 'colorsInUse', {
        get: function get() {
            var colorsInUse = [];
            for (var i = _this.playersInTheRoom.length - 1; i >= 0; i--) {
                var player = _this.playersInTheRoom[i];
                colorsInUse.push(player.color);
            }
            return colorsInUse;
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
    this.socket.on('teste', function (t) {
        return console.log(t);
    });
    gestureViewer(this);
    this.engine.run();
}
Game.prototype.newGame = function () {
    this.status = 'playing';
};
Game.prototype.addPlayers = function () {
    var playersInTheRoom = this.playersInTheRoom.length;
    for (var i = 0; i < playersInTheRoom; i++) {
        var playerInTheRoom = this.playersInTheRoom[i];
        var player = new Snake(this, playerInTheRoom);
        this.players.push(player);
    }
};
Game.prototype.addFoods = function () {
    var food = new Food(this, this.foods.length);
    this.foods.push(food);
    if (this.foods.length < gameProps.foods.qnt)
        this.addFoods();
};
Game.prototype.resizeCanvas = function () {
    var _this2 = this;
    var $snakes = document.querySelectorAll('.snake-chooser .snake');
    var chooseSnake_snakeSize = function chooseSnake_snakeSize() {
        for (var i = $snakes.length - 1; i >= 0; i--) {
            $snakes[i].style.width = _this2.tileSize + 'px';
            $snakes[i].style.height = _this2.tileSize + 'px';
        }
    };
    var resizeCanvas = function resizeCanvas() {
        var winSize = [window.innerWidth, window.innerHeight];
        // X, Y
        var tileSize = [0, 0].map(function (val, i) {
                return winSize[i] / gameProps.tiles[i];
            });
        _this2.tileSize = tileSize[tileSize[0] > tileSize[1] ? 1 : 0];
        chooseSnake_snakeSize();
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
};
Game.prototype.login = function (playerNickname, callback) {
    var _this3 = this;
    this.socket.emit('login', { playerNickname: playerNickname });
    this.socket.on('logged', function (data) {
        gameProps = Object.assign(gameProps, data.gameProps);
        data.player.idLocal = 0;
        _this3.multiplayerLocalAllow = data.multiplayerLocal;
        _this3.id = data.myID;
        _this3.playersInTheRoom = data.playersInTheRoom;
        _this3.playersInTheRoom.push(data.player);
        _this3.resizeCanvas();
        _this3.socketEvents();
        if (typeof callback == 'function')
            callback(data);
    });
    this.socket.on('multiplayer disabled', function () {
        _this3.socket.off('login');
        _this3.socket.off('logged');
        _this3.socket.off('multiplayer disabled');
        _this3.interface.dialogBox.alert('Danied', 'Local multiplayer disabled.');
    });
};
Game.prototype.socketEvents = function () {
    var _this4 = this;
    this.socket.on('start', function () {
        _this4.interface.closeModal();
        _this4.addPlayers();
        _this4.addFoods();
        _this4.newGame();
    });
    this.socket.on('newPlayer', function (player) {
        _this4.playersInTheRoom.push(player);
        _this4.interface.listPlayersInTheRoom();
    });
    this.socket.on('prepare multiplayer', function (arr) {
        for (var i = arr.length - 1; i >= 0; i--) {
            var player = arr[i];
            _this4.playersInTheRoom.push(player);
        }
        _this4.socket.emit('start');
    });
    this.socket.on('playersInTheRoom update', function (data) {
        var i = data.i;
        delete data.i;
        _this4.playersInTheRoom[i] = Object.assign(_this4.playersInTheRoom[i], data);
        game.interface.listPlayersInTheRoom();
    });
    this.socket.on('delPlayer', function (i) {
        delete _this4.playersInTheRoom[i];
        _this4.playersInTheRoom = _this4.playersInTheRoom.filter(Boolean);
    });
};
var gameProps = {};
function gestureViewer(game) {
    var $gestureViewer = document.querySelector('#gestureViewer'), $canvas = document.createElement('canvas'), ctx = $canvas.getContext('2d');
    $gestureViewer.appendChild($canvas);
    var ballPoints = {};
    var counter = 0;
    var drawLine = function drawLine(x0, y0, x1, y1) {
        ctx.strokeStyle = '#7da278';
        ctx.lineCap = 'round';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
    };
    window.addEventListener('touchstart', function (e) {
        if (game.status != 'playing')
            return;
        for (var i = e.changedTouches.length - 1; i >= 0; i--) {
            var touch = e.changedTouches[i];
            var ballPoint = {
                    x: touch.pageX,
                    y: touch.pageY
                };
            ballPoints[touch.identifier || ++counter] = ballPoint;
            drawLine(ballPoint.x - 1, ballPoint.y, ballPoint.x, ballPoint.y);
        }
    });
    window.addEventListener('touchmove', function (e) {
        if (game.status != 'playing')
            return;
        for (var i = e.changedTouches.length - 1; i >= 0; i--) {
            var touch = e.changedTouches[i];
            var ballPoint = ballPoints[touch.identifier || counter], x = touch.pageX, y = touch.pageY;
            drawLine(ballPoint.x, ballPoint.y, x, y);
            ballPoint.x = x;
            ballPoint.y = y;
        }
    });
    window.addEventListener('touchend', function (e) {
        if (game.status != 'playing')
            return;
        for (var i = e.changedTouches.length - 1; i >= 0; i--) {
            var touch = e.changedTouches[i];
            delete ballPoints[touch.identifier || counter];
        }
        setTimeout(function () {
            return ctx.clearRect(0, 0, $canvas.width, $canvas.height);
        }, 200);
    });
    document.ontouchmove = function (e) {
        e.preventDefault();
    };
    // Disable page scroll
    var canvasFullSize = function canvasFullSize() {
        $canvas.width = window.innerWidth;
        $canvas.height = window.innerHeight;
    };
    canvasFullSize();
    window.addEventListener('resize', canvasFullSize);
}
window.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
window.isLumia = /Lumia/i.test(navigator.userAgent);
window.isElectron = /Electron/i.test(navigator.userAgent);
function Interface(game) {
    var _this = this;
    var $interface = document.querySelector('#interface'), $modal = $interface.querySelector('.modal'), $loginForm = $interface.querySelector('#login form'), $inputNickname = $loginForm.querySelector('[name="player_name"]'), $submitChooser = document.querySelector('#after-login .submit'), $mainMenu = $interface.querySelector('#main-menu'), $singlePlayer = $mainMenu.querySelector('#single-player'), $multiplayer = $mainMenu.querySelector('#multiplayer'), $multiplayerMenu = $interface.querySelector('#multiplayer-menu'), $multiplayerSubmit = $multiplayerMenu.querySelector('.submit'), $player2Name = $multiplayerMenu.querySelector('[name="player_name"]'), $playersQtn = $multiplayerMenu.querySelector('.input-number'), $multiplayerLocal = $interface.querySelector('#multiplayer-local'), $multiplayerLocalMenu = $interface.querySelector('#multiplayer-local-menu'), $connectedPlayers = $interface.querySelectorAll('.connected-players ul'), $multiplayerLocalMenuSubmit = $multiplayerLocalMenu.querySelector('.submit');
    this.dialogBox = new DialogBox($interface);
    var snakeChooser = new SnakeChooser($interface);
    new InputNumber();
    this.closeModal = function () {
        return $modal.classList.add('closed');
    };
    this.open = function (what) {
        return $interface.className = what;
    };
    this.listPlayersInTheRoom = function () {
        for (var i = $connectedPlayers.length - 1; i >= 0; i--) {
            var $_connectedPlayers = $connectedPlayers[i];
            var playersInTheRoomLength = game.playersInTheRoom.length;
            var lis = '';
            for (var j = 0; j < playersInTheRoomLength; j++) {
                var playerInTheRoom = game.playersInTheRoom[j];
                lis += '<li>\n                            <span\n                                style="color: ' + gameProps.snakes.colors[playerInTheRoom.color] + ';">\n                                ' + playerInTheRoom.nickname + '\n                            </span>\n                            <div class="snake"\n                                style="background: ' + gameProps.snakes.colors[playerInTheRoom.color] + ';\n                                width: ' + game.tileSize + 'px; height: ' + game.tileSize + 'px;">\n                            </div>\n                        </li>';
            }
            $_connectedPlayers.innerHTML = lis;
        }
    };
    var $welcomeText = $mainMenu.querySelector('#welcome');
    $loginForm.addEventListener('submit', function (e) {
        game.login($inputNickname.value, function (data) {
            $welcomeText.innerHTML = 'Hi, ' + $inputNickname.value;
            snakeChooser.changeSnakeColor();
            _this.open('after-login');
        });
    });
    $singlePlayer.addEventListener('click', function (e) {
        game.socket.emit('start');
    });
    $submitChooser.addEventListener('click', function () {
        var colorsInUse = game.colorsInUse;
        if (colorsInUse.includes(snakeChooser.currentColor))
            return _this.dialogBox.alert('Denied', 'This color is being used.');
        game.socket.emit('changeColor', snakeChooser.currentColor);
        if (game.multiplayerLocalAllow) {
            _this.listPlayersInTheRoom();
            $multiplayerLocalMenu.className = 'multiplayer-local-viewer';
            $multiplayerLocalMenu.querySelector('h4').innerText = 'Waiting to play ...';
            _this.open('multiplayer-local-menu');
        } else
            _this.open('main-menu');
    });
    $multiplayer.addEventListener('click', function () {
        snakeChooser.currentColor = 0;
        snakeChooser.changeSnakeColor();
        _this.open('multiplayer-menu');
    });
    $multiplayerSubmit.addEventListener('click', function () {
        var colorsInUse = game.colorsInUse;
        if (colorsInUse.includes(snakeChooser.currentColor))
            return _this.dialogBox.alert('Denied', 'This color is being used.');
        game.socket.emit('prepare multiplayer', {
            nickname: $player2Name.value,
            color: snakeChooser.currentColor,
            nPlayers: $playersQtn.getAttribute('data-value')
        });
    });
    $multiplayerLocal.addEventListener('click', function () {
        _this.open('multiplayer-local-menu');
        game.multiplayerLocalAllow = true;
        game.socket.emit('multiplayer-local-allow');
    });
    $multiplayerLocalMenuSubmit.addEventListener('click', function () {
        game.socket.emit('start');
    });
}
function Snake(game, props) {
    var _this = this;
    this.id = null;
    this.idLocal = null;
    this.nickname = null;
    this.body = [];
    this.color = 0;
    this.bodyStart = [0, 0];
    this.killed = false;
    this.merge(props);
    if (this.idLocal == 0)
        this.touchArea = 'all';
    if (this.idLocal == 1) {
        game.players[0].touchArea = 'right';
        this.touchArea = 'left';
    }
    console.log(this);
    game.engine.add(this);
    if (!isNaN(this.idLocal))
        new SnakeControls(this, game);
    game.socket.on('snakeUpdate-' + this.id, function (data) {
        return _this.update(data);
    });
    this.draw = function () {
        if (_this.killed)
            return;
        game.ctx.fillStyle = gameProps.snakes.colors[_this.color];
        _this.body.forEach(function (bodyFragment) {
            game.ctx.fillRect(bodyFragment[0] * game.tileSize, bodyFragment[1] * game.tileSize, game.tileSize, game.tileSize);
        });
    };
}
function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
            arr2[i] = arr[i];
        }
        return arr2;
    } else {
        return Array.from(arr);
    }
}
function SnakeControls(snake, game) {
    var pushMovement = function pushMovement(moveTo) {
        if (!moveTo)
            return;
        game.socket.emit('moveTo', {
            id: snake.id,
            moveTo: moveTo
        });
    };
    var $touchAreas = document.querySelector('#touch-areas');
    var $touchArea = {
            left: $touchAreas.querySelector('#left'),
            right: $touchAreas.querySelector('#right')
        };
    // Keyboard
    var keyMap = function (map) {
            return map ? {
                directions: Object.keys(map),
                keys: Object.keys(map).map(function (k) {
                    return map[k];
                }),
                direction: function direction(key) {
                    return this.directions[this.keys.indexOf(key)];
                }
            } : undefined;
        }(gameProps.snakes.keyMaps[snake.idLocal]);
    keyMap && window.addEventListener('keydown', function (e) {
        return pushMovement(keyMap.direction(e.key));
    });
    // Touch devices 
    var touchstart = {}, touchmove = {}, sensibilityTouch = gameProps.snakes.sensibilityTouch;
    var directions = [["left", "right"], ["up", "down"]];
    var orientationMap = {
            0: 'portrait-primary',
            180: 'portrait-secondary',
            90: 'landscape-primary',
            '-90': 'landscape-secondary'
        };
    var getOrientation = function getOrientation() {
        return screen.msOrientation || (screen.orientation || screen.mozOrientation || {}).type || orientationMap[window.orientation];
    };
    var orientation = getOrientation();
    window.addEventListener('orientationchange', function () {
        return orientation = getOrientation();
    });
    var touchHandle = function touchHandle(touchedArea) {
        var dragged = [[], []].map(function (_, axis) {
                return touchstart[touchedArea][axis] - touchmove[touchedArea][axis];
            });
        if (isLumia) {
            if (orientation === 'landscape-primary')
                dragged[0] = -dragged[0];
            else if (orientation === 'landscape-secondary')
                dragged[1] = -dragged[1];
            if (orientation.indexOf('landscape') > -1)
                dragged.reverse();
            if (orientation === 'portrait-secondary') {
                dragged[0] = -dragged[0];
                dragged[1] = -dragged[1];
            }
        }
        if (touchedArea != snake.touchArea && snake.touchArea != 'all')
            return;
        var touchAxis = +(Math.abs(dragged[0]) < Math.abs(dragged[1])), moveIndex = +(dragged[touchAxis] < 0), direction = directions[touchAxis][moveIndex];
        if (Math.abs(dragged[touchAxis]) >= sensibilityTouch) {
            if (direction != snake.direction)
                pushMovement(direction);
            touchstart[touchedArea] = [].concat(_toConsumableArray(touchmove[touchedArea]));
        }
    };
    var touchPos = function touchPos(e) {
        return [e.changedTouches[0].pageX, e.changedTouches[0].pageY];
    };
    if (snake.touchArea) {
        var $touchAreaKeys = Object.keys($touchArea);
        var _loop = function _loop(i) {
            var area = $touchAreaKeys[i];
            console.log($touchArea[area]);
            $touchArea[area].addEventListener('touchstart', function (e) {
                return touchstart[area] = touchPos(e);
            });
            $touchArea[area].addEventListener('touchmove', function (e) {
                touchmove[area] = touchPos(e);
                touchHandle(area);
            });
        };
        for (var i = $touchAreaKeys.length - 1; i >= 0; i--) {
            _loop(i);
        }
    }
}
function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
            arr2[i] = arr[i];
        }
        return arr2;
    } else {
        return Array.from(arr);
    }
}
Array.prototype.isEqual = function (arr) {
    return JSON.stringify(this) === JSON.stringify(arr);
};
Array.prototype.sumWith = function () {
    for (var _len = arguments.length, arrays = Array(_len), _key = 0; _key < _len; _key++) {
        arrays[_key] = arguments[_key];
    }
    var arrays = [this].concat(_toConsumableArray(arrays)).sort(function (a, b) {
            return b.length - a.length;
        }),
        // Order by DESC
        newArray = [].concat(_toConsumableArray(arrays[0]));
    // Largest array of the list
    for (var i = 1, arrLeng = arrays.length; i < arrLeng; i++) {
        var array = arrays[i];
        for (var j = 0, itemLeng = array.length; j < itemLeng; j++) {
            var item = array[j];
            newArray[j] += item;
        }
    }
    return newArray;
};
Array.prototype.lastItem = function () {
    return this[this.length - 1];
};
Object.prototype.merge = function (object) {
    for (var key in object) {
        this[key] = object[key];
    }
};
function DialogBox($interface) {
    this.alert = function (title, text, callback) {
        var $modal = $interface.querySelector('.modal');
        var $alert = document.createElement('div');
        $alert.classList.add('dialog-box', 'alert');
        $alert.innerHTML = '<h1>' + title + '</h1>\n                           <p>' + text + '</p>\n                           <button>Ok</button>';
        var $buttonOk = $alert.querySelector('button');
        $interface.insertBefore($alert, $modal);
        $buttonOk.focus();
        $buttonOk.addEventListener('click', function () {
            $buttonOk.parentNode.remove();
            typeof callback == 'function' && callback();
        });
    };
}
function InputNumber() {
    var $inputsNumber = document.querySelectorAll('.input-number');
    var _loop = function _loop(i) {
        var $inputNumber = $inputsNumber[i];
        var $input = $inputNumber.querySelector('span'), $decrementButton = $inputNumber.querySelector('.decrement'), $incrementButton = $inputNumber.querySelector('.increment');
        $decrementButton.addEventListener('click', function () {
            var value = +$inputNumber.getAttribute('data-value'), min = $inputNumber.getAttribute('data-min') || -Infinity;
            if (value > min) {
                value--;
                $input.innerHTML = value == 0 ? 'o' : value;
                $inputNumber.setAttribute('data-value', value);
            }
        });
        $incrementButton.addEventListener('click', function () {
            var value = +$inputNumber.getAttribute('data-value'), max = $inputNumber.getAttribute('data-max') || Infinity;
            if (value < max) {
                value++;
                $input.innerHTML = value == 0 ? 'o' : value;
                $inputNumber.setAttribute('data-value', value);
            }
        });
    };
    for (var i = $inputsNumber.length - 1; i >= 0; i--) {
        _loop(i);
    }
}
function SnakeChooser($interface) {
    var _this = this;
    var $snakeChoosers = $interface.querySelectorAll('.snake-chooser');
    this.currentColor = 0;
    this.changeSnakeColor = function () {
        var colorsInUse = game.colorsInUse;
        for (var i = $snakeChoosers.length - 1; i >= 0; i--) {
            var $snakeChooser = $snakeChoosers[i];
            var $chooserPrev = $snakeChooser.querySelector('.chooser-prev'), $chooserNext = $snakeChooser.querySelector('.chooser-next'), $snake = $snakeChooser.querySelector('.snake');
            $chooserPrev.classList.remove('disabled');
            $chooserNext.classList.remove('disabled');
            if (colorsInUse.includes(_this.currentColor))
                $snake.classList.add('color-in-use');
            else
                $snake.classList.remove('color-in-use');
            if (_this.currentColor == 0)
                $chooserPrev.classList.add('disabled');
            if (_this.currentColor == gameProps.snakes.colors.length - 1)
                $chooserNext.classList.add('disabled');
            $snake.style.background = gameProps.snakes.colors[_this.currentColor];
        }
    };
    for (var i = $snakeChoosers.length - 1; i >= 0; i--) {
        var $snakeChooser = $snakeChoosers[i];
        var $chooserPrev = $snakeChooser.querySelector('.chooser-prev'), $chooserNext = $snakeChooser.querySelector('.chooser-next');
        $chooserPrev.addEventListener('click', function (e) {
            if (e.target.className.indexOf('disabled') == -1) {
                _this.currentColor--;
                _this.changeSnakeColor();
            }
        });
        $chooserNext.addEventListener('click', function (e) {
            if (e.target.className.indexOf('disabled') == -1) {
                _this.currentColor++;
                _this.changeSnakeColor();
            }
        });
    }
}
if ('serviceWorker' in navigator && !isElectron) {
    navigator.serviceWorker.register('serviceWorker.js').then(function () {
        return console.log('Service worker funcionando');
    }).catch(function () {
        return console.log('Erro ao instalar service worker');
    });
}