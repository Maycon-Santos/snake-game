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

        game.socket.on('delete player', () => $multiplayerLocalMenuSubmit.removeAttribute('disabled'));

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

    this.label = (text, type, hideTime = 1000) => {

        const $type = document.createElement(type == 0 ? 'span' : 'strong');

        $type.innerText = text;

        $label.innerHTML = '';
        $label.appendChild($type);

        setTimeout(() => $type.className = 'show', 0);
        setTimeout(() => $type.remove(), hideTime);

    }

    game.socket.on('countdown', n => this.label(n, 1));

    game.socket.on('show powerup', p => this.label(p, 0, 500));

}