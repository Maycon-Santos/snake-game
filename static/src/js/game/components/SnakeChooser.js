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
            }
        });

        $chooserNext.addEventListener('click', e => {
            if(e.target.className.indexOf('disabled') == -1){
                this.currentColor++;
                this.changeSnakeColor();
            }
        });

    }

}