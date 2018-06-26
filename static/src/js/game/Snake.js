function Snake(game, id){

    this.id = id;
    this.idLocal = 0;

    this.nickname = null;

    this.body = [];
    this.color = 0;

    this.killed = false;

    this.bodyStart = [0, 0];

    game.engine.add(this);

    if(game.id == this.id) new SnakeControls(this, game);

    game.socket.on(`snakeUpdate-${id}`, this.update);

    this.draw = () => {

        if(this.killed) return;

        game.ctx.fillStyle = gameProps.snakes.colors[this.color];

        this.body.forEach(bodyFragment => {
            game.ctx.fillRect(
                bodyFragment[0] * game.tileSize,
                bodyFragment[1] * game.tileSize,
                game.tileSize,
                game.tileSize
            );
        });

    }

}