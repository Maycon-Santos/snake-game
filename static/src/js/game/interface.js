function Interface(game){

    var $interface = document.querySelector('#interface'),
        $modal = $interface.querySelector('.modal'),
        $loginForm = $interface.querySelector('#login form'),
        $inputNickname = $loginForm.querySelector('[name="player_name"]'),
        
        $submitChooser = document.querySelector('#after-login .submit'),

        $mainMenu = $interface.querySelector('#main-menu'),
        $singlePlayer = $mainMenu.querySelector('#single-player'),
        $multiplayer = $mainMenu.querySelector('#multiplayer'),
        $multiplayerLocal = $interface.querySelector('#multiplayer-local'),

        $singlePlayerMenu = $interface.querySelector('#single-player-menu'),
        $singlePlayerSubmit = $singlePlayerMenu.querySelector('.submit'),
        $singlePlayer_playersQtn = $singlePlayerMenu.querySelector('.input-number'),
        $backSinglePlayerMenu = $singlePlayerMenu.querySelector('.back'),

        $multiplayerMenu = $interface.querySelector('#multiplayer-menu'),
        $multiplayerSubmit = $multiplayerMenu.querySelector('.submit'),
        $player2Name = $multiplayerMenu.querySelector('[name="player_name"]'),
        $multiplayer_playersQtn = $multiplayerMenu.querySelector('.input-number'),
        $backMultiplayerMenu = $multiplayerMenu.querySelector('.back'),
        
        $multiplayerLocalMenu = $interface.querySelector('#multiplayer-local-menu'),
        $connectedPlayers = $interface.querySelectorAll('.connected-players ul'),
        $multiplayerLocalMenuSubmit = $multiplayerLocalMenu.querySelector('.submit'),
        $playerCounter = $multiplayerLocalMenu.querySelector('.player-counter span'),
        $address = $multiplayerLocalMenu.querySelector('.address'),
        $backMultiplayerLocalMenu = $multiplayerLocalMenu.querySelector('.back'),
        
        $gameOver = $interface.querySelector('#game-over'),
        $gameOverText = $gameOver.querySelector('h2 span'),
        $gameOverSubmit = $gameOver.querySelector('.submit');

    this.dialogBox = new DialogBox($interface);
    const snakeChooser = new SnakeChooser($interface);
    new InputNumber();

    this.openModal = () => $modal.classList.remove('closed');
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

        if(game.winner){
            $gameOverText.style.color = gameProps.snakes.colors[game.winner.color];
            $gameOverText.innerText = game.winner.nickname;
        }else{
            $gameOverText.style.color = 'inherit';
            $gameOverText.innerText = 'Nobody';
        }

        this.open('game-over');

    }

    const gameOverSubmit = open => {
        game.status = 'toStart';
        game.clear();
        this.openModal();
        this.open(open);
    }

    var $welcomeText = $mainMenu.querySelector('#welcome');
    $loginForm.addEventListener('submit', e => {
        game.login($inputNickname.value, data => {

            $welcomeText.innerHTML = `Hi, ${$inputNickname.value}`;
            snakeChooser.changeSnakeColor();
            this.open('after-login');

        });
    });

    $singlePlayer.addEventListener('click', e => 
        this.open('single-player-menu'));

    $singlePlayerSubmit.addEventListener('click', () => {

        game.socket.emit('prepare single-player', $singlePlayer_playersQtn.getAttribute('data-value'));
        $gameOverSubmit.onclick = () => gameOverSubmit('single-player-menu');

    });

    $backSinglePlayerMenu.addEventListener('click', () => this.open('main-menu'));

    $submitChooser.addEventListener('click', () => {

        var colorsInUse = game.colorsInUse;
        if(colorsInUse.includes(snakeChooser.currentColor))
            return this.dialogBox.alert('Denied', 'This color is being used.');

        game.socket.emit('change color', snakeChooser.currentColor);

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

        game.playersInTheRoom = [game.playersInTheRoom[0]];

        var colorsInUse = game.colorsInUse;
        if(colorsInUse.includes(snakeChooser.currentColor))
            return this.dialogBox.alert('Denied', 'This color is being used.');

        game.socket.emit('prepare multiplayer', {
            nickname: $player2Name.value,
            color: snakeChooser.currentColor,
            nPlayers: $multiplayer_playersQtn.getAttribute('data-value')
        });

        $gameOverSubmit.onclick = () => gameOverSubmit('multiplayer-menu');

    });

    $backMultiplayerMenu.addEventListener('click', () => this.open('main-menu'));

    $multiplayerLocal.addEventListener('click', () => {

        game.multiplayerLocalAllow = true;
        game.playersInTheRoom.length = 1;
        game.socket.emit('multiplayer-local allow');

    });

    this.openMultiplayerLocal = adress => {
        $address.innerText = adress;
        this.open('multiplayer-local-menu');
    }

    $multiplayerLocalMenuSubmit.addEventListener('click', () => {
        
        $multiplayerLocalMenuSubmit.setAttribute('disabled', true);
        game.socket.emit('ready');
        $gameOverSubmit.onclick = () => {
            $multiplayerLocalMenuSubmit.removeAttribute('disabled');
            gameOverSubmit('multiplayer-local-menu');
        }

    });

    $backMultiplayerLocalMenu.addEventListener('click', () => {

        game.playersInTheRoom = [game.playersInTheRoom[0]];
        game.socket.emit('multiplayer-local deny');
        this.open('main-menu');

    });

}