function Sounds(game){

    const $canvas = game.ctx.canvas;

    const path = 'sounds';

    const soundMap = {
        menu: 'menu.wav',
        back: 'back.wav',
        prev: 'prev.wav',
        next: 'next.wav',
        died: 'died.wav',
        ate: 'ate.wav',
        enter: 'enter.wav',
        gameOver: 'game-over.wav'
    }

    const addPlayers = (() => {

        const keys = Object.keys(soundMap);
        for (let i = 0, L = keys.length; i < L; i++) {
            const key = keys[i];
            const sound = soundMap[key];

            let audioExtension = sound.split('.').lastItem();

            let $player = document.createElement('audio');
            $player.className = 'sound';
            $player.src = `${path}/${sound}`;
            $player.setAttribute('type', `audio/${audioExtension == 'mp3' ? 'mpeg' : audioExtension}`);

            $canvas.parentNode.insertBefore($player, $canvas);

            this[key] = {};

            Object.defineProperties(this[key], {

                play: {
                    get: () => {
                        if(!game.mute){
                            $player.currentTime = 0;
                            $player.play();
                        }
                    }
                },

                volume: {
                    get: () => $player.volume,
                    set: v => $player.volume = v
                }

            });

        }

    })();

}