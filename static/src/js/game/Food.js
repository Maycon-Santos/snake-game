function Food(game, id){

    this.id = id;

    this.color;

    // Previous position (used to compare and know when the current position is changed)
    var prevPosition = [];

    // Position of the food
    this.position = [];

    game.engine.add(this);

    // Render
    this.draw = () => {

        // Checks if food position has changed
        if(!this.position.isEqual(prevPosition)){
            // Play sound of eating
            game.sounds.ate.play;
            prevPosition = [...this.position];
        }

        // If don't have color stop now
        if(!this.color) return;

        game.ctx.fillStyle = this.color;

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