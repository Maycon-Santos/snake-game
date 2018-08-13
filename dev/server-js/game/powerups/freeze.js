powerups.on('freeze', (snake, game) => {

    game.for('players', player => {

        if(player.enhancerId == snake.enhancerId) return;

        player.freeze += 10;

    });

});