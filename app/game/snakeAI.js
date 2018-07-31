function snakeAI(game, snake){

    var lockDirection = 0,
        preferredAxis;

    const selectFood = () => {

        let foods = game.foods,
            selectedFood = foods[Math.round(Math.random() * (foods.length - 1))];

        return selectedFood;
        
    }

    var food = selectFood();

    game.event.on('foodEated', id => {

        if(food.id == id){
            food = selectFood();
            preferredAxis = undefined;
        }

    });

    const hazardousDirections = () => {
        
        const directions = [],
              enhancerId = snake.enhancerId,
              head = snake.head;
        
        game.for('players', (player, PlayerEnhancerId) =>
            (player.killed || enhancerId == PlayerEnhancerId) ? null :

            game.for(player.body, bodyFrag => game.for(bodyFrag, (_, axis) => {

                const otherAxis = (axis == 1) ? 0 : 1;

                if(!bodyFrag[axis].isEqual(head[axis])) return;

                const distance = head[otherAxis] - bodyFrag[otherAxis],
                      distanceABS = Math.abs(distance);

                if(distanceABS <= 5){

                    const dir = distance / distanceABS,
                          direction = -(dir) * (otherAxis + 1);
                          
                    directions.push(snake.directionMap[direction]);

                }

            }))

        );

        return directions.concat(snake.verticesDirections);
        
    }

    const movimentsToGetFood = () => {

        const movements = ['left', 'right', 'up', 'down'],
              toReturn = [],
              head = snake.head,
              foodPos = food.position,
              dontMoveTo = hazardousDirections();

        game.for(foodPos, (pos, axis) => {

            let movIndex = axis;

            // 1 = right or down
            if(foodPos[axis] > head[axis]) movIndex++;

            // Remove and get movement of the array
            const movement = movements.splice(movIndex, 1)[0];

            // If axis equals 1 the "movements" looks like this: ['left', 'up', 'down']
            // So, if in the next loop the axis equals 2 the movements looks like this: ['left', 'up']
            // These moves should be the last ones the snake will think of doing

            // If it is a dangerous move, you should be the last to think about doing it
            if(dontMoveTo.includes(movement) || foodPos[axis] == head[axis]) movements.push(movement);
            else toReturn.push(movement);

        });

        return toReturn.concat(movements.shuffle());

    }

    const movesToScape = (moves, dontMoveTo) => {

        const toReturn = [];
        
        game.for(moves, move => {

            if(!dontMoveTo.includes(move))
                toReturn.push(move);

        });

        return toReturn;

    }

    const axis = moviment => {
        if(moviment == 'left' || moviment == 'right') return 'horizontal';
        else return 'vertical';
    }

    this.movement = () => {

        let head = snake.head,
            movements = movesToScape(movimentsToGetFood(), hazardousDirections()),
            verticesDirections = snake.verticesDirections;

        if(preferredAxis == undefined)
            preferredAxis = Math.round(Math.random());

        game.for(food.position, (_, axis) => {

            if(food.position[axis] == head[axis] && preferredAxis == axis)
                preferredAxis = (preferredAxis == 1) ? 0 : 1;

        });

        for(let i = 0, L = movements.length; i < L; i++){
            const movement = movements[i];

            if(verticesDirections.includes(movement))
                movements.slice(i, 1);

        }

        if(movements.length >= 2){

            if(axis(movements[preferredAxis]) == snake.direction)
                preferredAxis = (preferredAxis == 1) ? 0 : 1;

            snake.direction = movements[preferredAxis];

        }else if(movements.length == 1)
            snake.direction = movements[0];
        else
            snake.direction = movements[movimentsToGetFood().shuffle()[0]];

    }

}