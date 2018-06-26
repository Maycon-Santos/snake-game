function Interface(game){

    var $interface = document.querySelector('#interface'),
        $modal = $interface.querySelector('.modal'),
        $loginForm = $interface.querySelector('#login form'),
        $inputNickname = $loginForm.querySelector('[name="player_name"]'),

        $snakeChooser = $interface.querySelector('#snake-chooser'),
        $chooserPrev = $snakeChooser.querySelector('#chooser-prev'),
        $chooserNext = $snakeChooser.querySelector('#chooser-next'),
        $snake = $snakeChooser.querySelector('.snake'),
        $submitChooser = $snakeChooser.querySelector('.submit'),

        $mainMenu = $interface.querySelector('#main-menu'),
        $singlePlayer = $mainMenu.querySelector('#single-player'),
        $multiplayer = $mainMenu.querySelector('#multiplayer');

    this.closeModal = () => $modal.classList.add('closed');

    this.open = what => $interface.className = what;

    var $welcomeText = $mainMenu.querySelector('#welcome');
    $loginForm.addEventListener('submit', e => {
        game.login($inputNickname.value, data => {

            $welcomeText.innerHTML = `Hi, ${$inputNickname.value}`;

            changeSnakeColor(0);
            this.open('snake-chooser');

        });
    });

    $singlePlayer.addEventListener('click', e => {
        game.socket.emit('single player');
    });

    var currentColor = 0;
    const changeSnakeColor = color => {

        if(currentColor == 0)
            $chooserPrev.className = 'disabled';

        if(currentColor == gameProps.snakes.colors.length - 1)
            $chooserNext.className = 'disabled';

        $snake.style.background = gameProps.snakes.colors[color];
    }
    
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

    $submitChooser.addEventListener('click', () => {

        game.socket.emit('changeColor', currentColor);
        this.open('main-menu');

    });

    $multiplayer.addEventListener('click', () => {

        game.socket.emit('multiplayer');

    });

}