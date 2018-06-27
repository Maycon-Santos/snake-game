function Interface(game){

    var $interface = document.querySelector('#interface'),
        $modal = $interface.querySelector('.modal'),
        $loginForm = $interface.querySelector('#login form'),
        $inputNickname = $loginForm.querySelector('[name="player_name"]'),

        $snakeChoosers = $interface.querySelectorAll('.snake-chooser'),
        
        $submitChooser = document.querySelector('#after-login .submit'),

        $mainMenu = $interface.querySelector('#main-menu'),
        $singlePlayer = $mainMenu.querySelector('#single-player'),
        $multiplayer = $mainMenu.querySelector('#multiplayer'),

        $multiplayerMenu = $interface.querySelector('#multiplayer-menu'),
        $multiplayerSubmit = $multiplayerMenu.querySelector('.submit'),
        $player2Name = $multiplayerMenu.querySelector('[name="player_name"]'),
        $playersQtn = $multiplayerMenu.querySelector('.input-number');

    this.closeModal = () => $modal.classList.add('closed');

    this.open = what => $interface.className = what;

    var $welcomeText = $mainMenu.querySelector('#welcome');
    $loginForm.addEventListener('submit', e => {
        game.login($inputNickname.value, data => {

            $welcomeText.innerHTML = `Hi, ${$inputNickname.value}`;

            changeSnakeColor(0);
            this.open('after-login');

        });
    });

    $singlePlayer.addEventListener('click', e => {
        game.socket.emit('single player');
    });

    var currentColor = 0;
    const changeSnakeColor = color => {

        for (let i = $snakeChoosers.length - 1; i >= 0; i--) {
            const $snakeChooser = $snakeChoosers[i];
            
            let $chooserPrev = $snakeChooser.querySelector('.chooser-prev'),
                $chooserNext = $snakeChooser.querySelector('.chooser-next'),
                $snake = $snakeChooser.querySelector('.snake');

            if(currentColor == 0)
                $chooserPrev.classList.add('disabled');

            if(currentColor == gameProps.snakes.colors.length - 1)
                $chooserNext.classList.add('disabled');

            $snake.style.background = gameProps.snakes.colors[color];
        }
    }

    for (let i = $snakeChoosers.length - 1; i >= 0; i--) {
        const $snakeChooser = $snakeChoosers[i];
        
        let $chooserPrev = $snakeChooser.querySelector('.chooser-prev'),
            $chooserNext = $snakeChooser.querySelector('.chooser-next');

        $chooserPrev.addEventListener('click', e => {
            if(e.target.className.indexOf('disabled') == -1){
    
                $chooserNext.classList.remove('disabled');
    
                currentColor--;
    
                changeSnakeColor(currentColor);
            }
        });
    
        $chooserNext.addEventListener('click', e => {
            if(e.target.className.indexOf('disabled') == -1){
    
                $chooserPrev.classList.remove('disabled');
    
                currentColor++;
            
                changeSnakeColor(currentColor);
            }
        });

    }

    $submitChooser.addEventListener('click', () => {

        game.socket.emit('changeColor', currentColor);
        this.open('main-menu');

    });

    $multiplayer.addEventListener('click', () => {

        this.open('multiplayer-menu');

    });

    $multiplayerSubmit.addEventListener('click', () => {
        game.socket.emit('multiplayer', {
            nickname: $player2Name.value,
            color: currentColor,
            nPlayers: $playersQtn.getAttribute('data-value')
        });
    });

}