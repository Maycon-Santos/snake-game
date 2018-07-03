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