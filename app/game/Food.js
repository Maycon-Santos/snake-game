function Food(game, id){

    this.id = id;

    // Receive food types by gameProps
    var foodTypes = [];
    this.type;

    this.position = [];

    game.engine.add(this);

    // Set food types and chance
    for (const key in gameProps.foods.types) {
        const foodType = gameProps.foods.types[key],
              chance = foodType.chance;

        for (let i = 0; i < chance; i++) foodTypes.push(foodType);
    }

    // Function responsible for sending the processed data to the client
    this.senUpdate = update =>
        game.engine.sendUpdate('foods', this.id, update);

    this.create = function(){

        const selectFood = Math.round(Math.random() * (foodTypes.length - 1));

        this.type = foodTypes[selectFood];

        // Generate a new position
        this.position = [[], []].map((_, axis) => Math.round(Math.random() * (gameProps.tiles[axis] - 1)));
    
        this.senUpdate({position: this.position, color: this.type.color});

    }

    this.create();

}