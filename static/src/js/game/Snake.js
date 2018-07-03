function Snake(game, props){

    this.id = null;
    this.idLocal = null;
    this.enhancerId = null;
    this.nickname = null;
    this.body = [];
    this.color = 0;
    this.bodyStart = [0, 0];
    this.killed = false;

    this.merge(props);

    if(this.idLocal == 0) this.touchArea = 'all';

    if(this.idLocal == 1){
        game.players[0].touchArea = 'right';
        this.touchArea = 'left';
    }

    game.engine.add(this);

    if(!isNaN(this.idLocal)) new SnakeControls(this, game);

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