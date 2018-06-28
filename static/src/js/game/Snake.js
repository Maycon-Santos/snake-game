function Snake(game, props){

    this.id = null;
    this.idLocal = null;
    this.nickname = null;
    this.body = [];
    this.color = 0;
    this.bodyStart = [0, 0];

    this.merge(props);

    this.killed = false;

    game.engine.add(this);

    if(!isNaN(this.idLocal)) new SnakeControls(this, game);

    game.socket.on(`snakeUpdate-${this.id}`, this.update);

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