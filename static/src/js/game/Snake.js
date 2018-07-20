function Snake(game, props){

    this.id = null;

    // Id in relation to the player in the machine itself (0 is player 1, 1 is player 2)
    this.idLocal = null;

    this.enhancerId = null;

    this.nickname = null;

    this.body = [];

    this.color = 0;

    let killed = false;
    Object.defineProperty(this, 'killed', {
        get: () => killed,
        set: Bool => {
            if(Bool){
                game.sounds.died.play;
                game.interface.listPlayersInGame();
            }
            killed = Bool;
        }
    })

    this.merge(props);

    { // Multiplayer

        if(this.idLocal == 0) this.touchArea = 'all';

        if(this.idLocal == 1){
            game.players[0].touchArea = 'right';
            this.touchArea = 'left';
        }
        
    }

    game.engine.add(this);

    // Set controlls
    if(!isNaN(this.idLocal)) new SnakeControls(this, game);

    // Render
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