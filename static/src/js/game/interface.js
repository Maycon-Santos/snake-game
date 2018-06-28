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
        $playersQtn = $multiplayerMenu.querySelector('.input-number');

    this.closeModal = () => $modal.classList.add('closed');

    this.open = what => $interface.className = what;

    const snakeChooser = new SnakeChooser($interface);
    const dialogBox = new DialogBox($interface);
    new InputNumber();

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

        game.socket.emit('changeColor', snakeChooser.currentColor);
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
            return dialogBox.alert('Denied', 'This color is being used.');

        game.socket.emit('prepare multiplayer', {
            nickname: $player2Name.value,
            color: snakeChooser.currentColor,
            nPlayers: $playersQtn.getAttribute('data-value')
        });

    });

}