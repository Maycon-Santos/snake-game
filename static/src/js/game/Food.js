function Food(game){

    var foodTypes = [], type;

    this.position = [];

    for (const key in gameProps.foods.types) {
        const foodType = gameProps.foods.types[key],
              chance = foodType.chance;

        for (let i = 0; i < chance; i++) foodTypes.push(foodType);
    }

    this.create = function(){

        const selectFood = Math.round(Math.random() * (foodTypes.length - 1));

        type = foodTypes[selectFood];

        this.position = [[], []].map((_, axis) => Math.round(Math.random() * (gameProps.tiles[axis] - 1)));
    
    }

    this.update = () => {
    }

    this.draw = () => {

        if(game.status != 'playing') return;

        game.ctx.fillStyle = type.color;

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