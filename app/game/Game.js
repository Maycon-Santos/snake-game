function Game(){

    this.playersInTheRoom = [];

    this.status = 'toStart';
    this.engine = new Engine(this);

    this.engine.run();

}

Game.prototype.newGame = function(){

    this.players = [];
    this.foods = [];

    this.engine.clear();
    new GameRules(this);

    this.addPlayers();
    this.addFoods();

    this.for('players', player => {
        player.newBody();
    });

    this.for('foods', food => {
        food.create();
    });

    this.status = "playing";

}

Game.prototype.for = function(object, fn){
    for (let id = this[object].length-1; id >= 0; id--)
        fn(this[object][id], id);
}

Game.prototype.addPlayers = function(){

    io.emit('teste', this.playersInTheRoom);

    for (let i = this.playersInTheRoom.length - 1; i >= 0 ; i--) {
        const playerInTheRoom = this.playersInTheRoom[i];

        let player = Object.assign(new Snake(this, playerInTheRoom.id), playerInTheRoom.playerProps);

        this.players.push(player);
    }

}

Game.prototype.addFoods = function(){

    for (let i = 0; i < gameProps.foods.qnt; i++) {
        const element = gameProps.foods.qnt[i];
        
        let food = new Food(this, this.foods.length);
        this.foods.push(food);

    }

}