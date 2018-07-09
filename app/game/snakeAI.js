function snakeAI(game, snake){

    var lockDirection = 0,
        movements = ['left', 'right', 'up', 'down'];

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

            return areas;

        })();

        var movesToGetFood = [['left', 'right'], ['up', 'down']].map((mov, axis) => {
            if(food.position[axis] < snake.head[axis])
                return mov[0];
            else if(food.position[axis] != snake.head[axis])
                return mov[1];
            else
                return null;
        });

        var axis = Math.round(Math.random()),
            selectMovement = movesToGetFood[axis];

        if(hazardousAreas.includesArr(snake.predictMovement(selectMovement))){

            [...movements].shuffle().map(direction => {

                if(!hazardousAreas.includesArr(snake.predictMovement(direction))){
                    selectMovement = direction;
                }

            });

            food = selectFood();

        }

        io.emit('teste', snake.bodyVertices);

        /*
            NÃO TA FUNCIONANDO

            Já tenho o corpo da cobrinha separada em vértices
            Próximo passo: Identificar o vértice que está ao lado dela e evitar que ela vá para essa direção
            Obs: Não deve ser regra absoluta, se não houver saída ela vai pra esse caminho mesmo
        */

        // for (let i = 0; i < 2; i++) {

        //     let sumAxis = Math.round(movements.indexOf(selectMovement) / 3) * 2;
                
        //     if((snake.predictMovement(selectMovement)[i] + 4 == snake.body[2][i]
        //     || snake.predictMovement(selectMovement)[i] - 4 == snake.body[2][i])){

        //         let _movements = [...movements];
        //         delete _movements[_movements.indexOf(selectMovement)];

        //         [..._movements].shuffle().map(direction => {

        //             if(!hazardousAreas.includesArr(snake.predictMovement(direction))){
        //                 selectMovement = direction;
        //             }
    
        //         });

        //     }
            
        // }

        if(selectMovement) snake.direction = selectMovement;

    }

}