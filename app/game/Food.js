function Food(game, id){

    this.id = id;

    var foodTypes = []
    this.type;

    this.position = [];

    game.engine.add(this);

    for (const key in gameProps.foods.types) {
        const foodType = gameProps.foods.types[key],
              chance = foodType.chance;

        for (let i = 0; i < chance; i++) foodTypes.push(foodType);
    }

    this.create = function(){

        const selectFood = Math.round(Math.random() * (foodTypes.length - 1));

        this.type = foodTypes[selectFood];

        this.position = [[], []].map((_, axis) => Math.round(Math.random() * (gameProps.tiles[axis] - 1)));
    
        io.emit('teste', 'food');
        io.emit(`foodUpdate-${id}`, {position: this.position, type: this.type});
    }

}