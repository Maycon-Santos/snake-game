function SnakeControls(snake, game){

    var rowMovements = [];

    eventEmitter.on(`moveTo-${snake.id}`, moveTo => rowMovements.push(moveTo));

    //Set current movement
    this.currentMovement = () => {

        rowMovements = rowMovements.filter(Boolean);

        if(!rowMovements.length) return;
        snake.direction = rowMovements[0];
        rowMovements && rowMovements.splice(0, 1);

    }

}