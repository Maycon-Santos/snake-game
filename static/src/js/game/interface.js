function Interface(game){

    var $interface = document.querySelector('#interface'),
        $modal = $interface.querySelector('.modal'),
        $loginForm = $interface.querySelector('#login form'),
        $inputNickname = $loginForm.querySelector('[name="player_name"]'),
        $mainMenu = $interface.querySelector('#main-menu'),
        
        $singlePlayer = $mainMenu.querySelector('#single-player');

    this.closeModal = () => {
        $modal.classList.add('closed');
    }

    var $welcomeText = $mainMenu.querySelector('#welcome');
    const openMainMenu = nickname => {
        $welcomeText.innerHTML = `Hi, ${nickname}`;
        $interface.className = 'main-menu';
    }

    $loginForm.addEventListener('submit', e => {
        game.login($inputNickname.value, data => {
            console.log(data);
            openMainMenu($inputNickname.value);
        });
    });

    $singlePlayer.addEventListener('click', e => {
        game.socket.emit('single player');
    });

}