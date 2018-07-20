powerups.set('super slow', (snake, game) => {

    game.for('players', player => {

        if(player.enhancerId == snake.enhancerId) return;

        player.superSlow += 50;

    });

});