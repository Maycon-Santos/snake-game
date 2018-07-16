function Interface(game){

    const $ = (path, path2) => {

        var get;

        if(path2){
            get = path.querySelectorAll(path2);
        }else{
            get = document.querySelectorAll(path);
        }

        return get.length > 1 ? get : get[0];

    }

    const $interface     = $('#interface'),
          $modal         = $($interface, '.modal'),
          $loginForm     = $($interface, '#login form'),
          $inputNickname = $($loginForm, '[name="player_name"]');
        
    const $submitChooser = $('#after-login .submit');

    const $mainMenu         = $($interface, '#main-menu'),
          $welcomeText      = $($mainMenu, '#welcome'),
          $singlePlayer     = $($mainMenu, '#single-player'),
          $multiplayer      = $($mainMenu, '#multiplayer'),
          $multiplayerLocal = $($mainMenu, '#multiplayer-local');

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
        
    const $gameOver       = $($interface, '#game-over'),
          $gameOverText   = $($gameOver, 'h2 span'),
          $gameOverSubmit = $($gameOver, '.submit');
        
    const $nameOfPlayers = $($interface, '#name-of-players ul');

    const $audioToggle = $('#audio-toggle');

    const snakeColor = color => gameProps.snakes.colors[color];

    this.dialogBox     = new DialogBox($interface);
    const snakeChooser = new SnakeChooser($interface);

    new InputNumber();

    if(localStorage.getItem('lastNickname'))
        $inputNickname.value = localStorage.getItem('lastNickname');

    $inputNickname.focus();

    this.openModal = () => $modal.classList.remove('closed');
    this.closeModal = () => $modal.classList.add('closed');
    this.open = what => $interface.className = what;

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

    this.listPlayersInGame = () => {
        
        let li = '';

        game.for('playersInTheRoom', player =>
            li += `<li style="color: ${snakeColor(player.color)};">${player.nickname}</li>`);

        $nameOfPlayers.innerHTML = li;

    }

    this.playerOnDeath = enhancerId => {

        const list = $($nameOfPlayers, 'li');
        list[enhancerId].className = 'dead';

    }

    this.gameOver = () => {

        $gameOverText.style.color = game.winner ? snakeColor(game.winner.color) : 'inherit';
        $gameOverText.innerText = game.winner ? game.winner.nickname : 'Nobody';

        this.open('game-over');

    }

    const gameOverSubmit = (open, moreFn) => {

        $gameOverSubmit.onclick = () => {
            game.status = 'toStart';
            game.clear();
            this.openModal();
            this.open(open);
            game.sounds.menu.play;
            typeof moreFn == 'function' && moreFn();
        }

    }

    [$singlePlayer, $multiplayer, $multiplayerLocal, $submitChooser].map($el =>
        $el.addEventListener('click', () => game.sounds.menu.play));

    [$backSinglePlayerMenu, $backMultiplayerMenu, $backMultiplayerLocalMenu].map($el =>
        $el.addEventListener('click', () => game.sounds.back.play));

    [$singlePlayerSubmit, $multiplayerSubmit, $multiplayerLocalMenuSubmit].map($el =>
        $el.addEventListener('click', () => game.sounds.enter.play));

    $loginForm.addEventListener('submit', e => {
        game.login($inputNickname.value, data => {

            $welcomeText.innerHTML = `Hi, ${$inputNickname.value}`;
            snakeChooser.changeSnakeColor();

            this.open('after-login');

            localStorage.setItem('lastNickname', $inputNickname.value);

            game.sounds.enter.play;

        });
    });

    $singlePlayer.addEventListener('click', e =>
        this.open('single-player-menu'));

    $singlePlayerSubmit.addEventListener('click', () => {

        game.socket.emit('prepare single-player', $singlePlayer_playersQtn.getAttribute('data-value'));
        gameOverSubmit('single-player-menu', () => game.playersInTheRoom.length = 1);

    });

    $backSinglePlayerMenu.addEventListener('click', () => this.open('main-menu'));

    $submitChooser.addEventListener('click', () => {

        const colorsInUse = game.colorsInUse;
        if(colorsInUse.includes(snakeChooser.currentColor))
            return this.dialogBox.alert('Denied', 'This color is being used.');

        game.socket.emit('change color', snakeChooser.currentColor);

        if(game.multiplayerLocalAllow){

            this.listPlayersInTheRoom();
            $multiplayerLocalMenu.className = 'multiplayer-local-viewer';
            $($multiplayerLocalMenu, ('h4')).innerText = 'Waiting to play ...';
            this.open('multiplayer-local-menu');

        }else this.open('main-menu');

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

        gameOverSubmit('multiplayer-menu', () => game.playersInTheRoom.length = 1);

    });

    $backMultiplayerMenu.addEventListener('click', () => this.open('main-menu'));

    $multiplayerLocal.addEventListener('click', () => {

        game.multiplayerLocalAllow = true;
        game.socket.emit('multiplayer-local allow');
        $multiplayerLocalMenuSubmit.removeAttribute('disabled');

    });

    this.openMultiplayerLocal = adress => {

        $address.innerText = adress;
        this.open('multiplayer-local-menu');

    }

    $multiplayerLocalMenuSubmit.addEventListener('click', () => {
        
        $multiplayerLocalMenuSubmit.setAttribute('disabled', true);
        game.socket.emit('ready');
        
        gameOverSubmit('multiplayer-local-menu', () => $multiplayerLocalMenuSubmit.removeAttribute('disabled'));

    });

    $backMultiplayerLocalMenu.addEventListener('click', () => {

        game.playersInTheRoom.length = 1;
        game.socket.emit('multiplayer-local deny');
        this.open('main-menu');

    });

    this.audioToggle = mute => $audioToggle.className = mute ? 'muted' : '';
    $audioToggle.addEventListener('click', () => game.mute = !game.mute);

}