function SnakeControls(snake, game){

    var rowMovements = [];

    game.event.on('moveTo', (data = {id, moveTo}) => {
        if(data.id == snake.id){
            if(data.moveTo != rowMovements.lastItem())
                rowMovements.push(data.moveTo);
        }
    });

    //Set current movement
    this.currentMovement = () => {

        rowMovements = rowMovements.filter(Boolean);

        if(!rowMovements.length) return;
        snake.direction = rowMovements[0];
        rowMovements && rowMovements.splice(0, 1);

    }

}