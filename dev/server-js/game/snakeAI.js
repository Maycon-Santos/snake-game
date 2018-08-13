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

                // Ex: food[y] == head[y]
                if(!bodyFrag[axis].isEqual(head[axis])) return;

                // Ex: food[x] - head[x] = z or -z
                const distance = head[otherAxis] - bodyFrag[otherAxis],
                      distanceABS = Math.abs(distance);

                if(distanceABS <= 5){

                    // dir = -1 or 1
                    // 1 is horizontal and 2 is vertical
                    // Ex: direction = -(1) * (0 + 1) = -1 (left)
                    //     direction = -(-1) * (0 + 1) = 1 (right)
                    //     direction = -(1) * (1 + 1) = -2 (up)
                    //     direction = -(-1) * (1 + 1) = 2 (down)
                    const dir = distance / distanceABS,
                          direction = -(dir) * (otherAxis + 1);
                          
                    directions.push(snake.directionMap[direction]);

                }

            }))

        );

        return directions.concat(snake.verticesDirections);
        
    }

    const movimentsToGetFood = movements => {

        const toReturn = [],
              head = snake.head,
              foodPos = food.position;

        game.for(foodPos, (_, axis) => {

            let movIndex = axis;

            // 1 = right or down
            if(foodPos[axis] > head[axis]) movIndex++;

            // Remove and get movement of the array
            const movement = movements.splice(movIndex, 1)[0];

            if(preferredAxis == axis){

                if(axis != movIndex){

                    if(movIndex > axis){ // Right or down

                        if(movIndex == 1){ // Right

                            if(snake.direction == 'left')
                                preferredAxis = 1;

                        }else if(movIndex == 2){ // Down

                            if(snake.direction == 'up')
                                preferredAxis = 0;

                        }

                    }else{ // Left or up

                        if(movIndex == 0){ // Left

                            if(snake.direction == 'right')
                                preferredAxis = 1;

                        }else if(movIndex == 1){ // Up

                            if(snake.direction == 'down')
                                preferredAxis = 1;

                        }

                    }

                    //preferredAxis = preferredAxis == 1 ? 0 : 1;
                }

            }

            // If axis equals 1 the "movements" looks like this: ['left', 'up', null]
            // So, if in the next loop the axis equals 2 the movements looks like this: ['left', 'up']
            // These moves should be the last ones the snake will think of doing

            if(axis == preferredAxis && foodPos[axis] != head[axis])
                toReturn.push(movement);

            if(axis != preferredAxis && foodPos[preferredAxis] == head[preferredAxis])
                toReturn.push(movement);

        });

        return toReturn.concat(movements.shuffle()).filter(Boolean);

    }

    const safeMovements = () => {

        const moves = ['left', 'right', 'up', 'down'],
              currentDirection = snake.direction,
              vDirections = snake.verticesDirections,
              dontMoveTo = hazardousDirections();
        
        game.for(moves, (move, i) => {

            if(!dontMoveTo.includes(move) && !vDirections.includes(move)){
                if(axis(move) == axis(currentDirection)){
                    if(currentDirection == move) return
                }else return;
            }

            moves[i] = null;


        });

        return moves;

    }

    const axis = moviment => {
        if(moviment == 'left' || moviment == 'right') return 'horizontal';
        else return 'vertical';
    }

    this.movement = () => {

        if(preferredAxis == undefined)
            preferredAxis = Math.round(Math.random());

        const movements = movimentsToGetFood(safeMovements());

        snake.direction = movements[0];

    }

}