function snakeAI(game, snake){

    const selectFood = () => {

        var lastFood, selectedFood;

        game.for('foods', food => {

            if(!lastFood) return selectedFood = lastFood = food;

            let distance = food.position.sumAll() - snake.head.sumAll(),
                lastFoodDistance = lastFood.position.sumAll() - snake.head.sumAll();

            if(Math.abs(distance) < Math.abs(lastFoodDistance)){
                selectedFood = food;
            }

            lastFood = food;

        });

        return selectedFood;

    }

    var food = selectFood();

    game.event.on('foodEated', id => {

        if(food.id == id) food = selectFood();

    });

    this.movement = () => {

        var hazardousAreas = (() => {

            var areas = [];

            game.for('players', (player, id) => {

                var body = [...player.body];

                if(id == snake.enhancerId) body.splice(0, 1);

                areas.push(...body);

            });

            return JSON.stringify(areas);

        })();

        var movements = [['left', 'right'], ['up', 'down']].map((mov, axis) => {
            if(food.position[axis] < snake.head[axis])
                return mov[0];
            else if(food.position[axis] != snake.head[axis])
                return mov[1];
            else
                return null;
        });

        var axis = Math.round(Math.random()),
            selectMovement = movements[axis];

        io.emit('teste', [hazardousAreas, JSON.stringify(snake.predictMovement(selectMovement))])

        if(hazardousAreas.includes(JSON.stringify(snake.predictMovement(selectMovement)))){

            ['left', 'right', 'up', 'down'].sort(() => 0.5 - Math.random()).map(direction => {

                if(!hazardousAreas.includes(JSON.stringify(snake.predictMovement(direction))))
                    selectMovement = direction;

            });

            food = selectFood();
        }

        if(selectMovement) snake.direction = selectMovement;

    }

}