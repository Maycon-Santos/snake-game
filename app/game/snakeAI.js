function snakeAI(game, snake){

    var lockDirection = 0,
        preferredAxis;

    const selectFood = () => {

        /* var lastFood, selectedFood;

        game.for('foods', food => {

            if(!lastFood) return selectedFood = lastFood = food;

            let distance = food.position.sumAll() - snake.head.sumAll(),
                lastFoodDistance = lastFood.position.sumAll() - snake.head.sumAll();

            if(Math.abs(distance) < Math.abs(lastFoodDistance)){
                selectedFood = food;
            }

            lastFood = food;

        });

        return selectedFood; */

        // ============================================

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

    Object.defineProperty(this, 'hazardousAreas', {
        get: () => {

            var areas = [],
                myHead = snake.head;

            game.for('players', player => {

                if(player.killed || player.enhancerId == snake.enhancerId) return;

                game.for(player.body, bodyFragment => {
                    
                    game.for(bodyFragment, (_, axis) => {

                        let otherAxis = Math.abs(axis - 1);

                        if(bodyFragment[axis].isEqual(myHead[axis], myHead[otherAxis] - 1, myHead[otherAxis] + 1)){

                            let distance = myHead[otherAxis] - bodyFragment[otherAxis],
                                distanceABS = Math.abs(distance);

                            if(distanceABS <= 3){

                                let dir = distance / distanceABS,
                                    direction = snake.directionMap[-(dir) * (otherAxis + 1)];

                                areas.push(direction);

                            }
                            
                        }

                    })

                });

            });

            return areas;

        }
    });

    Object.defineProperty(this, 'movementsByPriority', {
        get: () => {

            let movements = ['left', 'right', 'up', 'down'],
                movementsByPriority = [],
                head = snake.head,
                hazardousAreas = this.hazardousAreas;

            game.for(food.position, (pos, axis) => {

                let movIndex = axis;

                if(pos > head[axis]) movIndex++;

                let movement = movements.splice(movIndex, 1)[0];

                if(hazardousAreas.includes(movement) || pos == head[axis])
                    movements.push(movement);
                else
                    movementsByPriority.push(movement);

            });

            if(preferredAxis == undefined)
                preferredAxis = Math.round(Math.random());

            let snakeDirection = snake.direction;

            if((snakeDirection == 'right' && movementsByPriority[0] == 'left')
               || (snakeDirection == 'left' && movementsByPriority[0] == 'right')
               || (snakeDirection == 'up' && movementsByPriority[0] == 'down')
               || (snakeDirection == 'down' && movementsByPriority[0] == 'up'))
                    movementsByPriority.reverse();

            if(preferredAxis == 1) movementsByPriority.reverse();

            return [...movementsByPriority, ...movements.shuffle()];

        }
    });

    this.movement = () => {

        let movements = this.movementsByPriority,
            hazardousAreas = this.hazardousAreas,
            verticesDirections = snake.verticesDirections;

        let selectedMovement;

        for(let i = 0, L = movements.length; i < L; i++){
            const movement = movements[i];

            if(!movement) continue;
            
            if(!hazardousAreas.includes(movement) && !verticesDirections.includes(movement)){
                selectedMovement = movement;
                break;
            }

        }

        snake.direction = selectedMovement;

    }

}