function Food(game, id){

    this.id = id;
    this.type;

    this.position = [];

    game.engine.add(this);

    game.socket.on(`foodUpdate-${id}`, this.update);

    this.draw = () => {

        if(game.status != 'playing' || !this.type) return;

        game.ctx.fillStyle = this.type.color;

        game.ctx.beginPath();

        game.ctx.arc(
            this.position[0] * game.tileSize + game.tileSize / 2,
            this.position[1] * game.tileSize + game.tileSize / 2,
            game.tileSize / 2,
            0,
            Math.PI * 2
        );
        
        game.ctx.closePath();

        game.ctx.fill();

    }

}