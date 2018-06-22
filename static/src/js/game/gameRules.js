function gameRules(game){

    game.engine.add(this);

    const snakeColision = () => {

        game.for('players', (player, id) => {

            if(player.killed) return;

            let playerHead = player.head; // For performance. Accessing an object several times is heavy

            // player.body.every((bodyFragment, index) => {
            //     player.collided = index > 0 && bodyFragment.isEqual(playerHead);
            //     console.log(index, bodyFragment.isEqual(playerHead));
            //     if(player.collided) return; // Break the loop
            // });

            for (let index = player.body.length - 1; index >= 0; index--) {

                if(index > 0 && player.body[index].isEqual(playerHead))
                    return player.collided = true;

            }

            !player.collided && game.for('players', (otherPlayer, otherID) => {

                if(id == otherID || otherPlayer.killed) return;

                for (let index = otherPlayer.body.length - 1; index >= 0; index--) {

                    if(otherPlayer.body[index].isEqual(playerHead))
                        return player.collided = true;

                }

            });

        });

        game.for('players', player => player.killed = player.collided); // Kill the player if collided
    
    }

    const snakeAteFood = () => {
        game.for('foods', food => {
            game.for('players', player => {
                if(player.head.isEqual(food.position)){
                    player.increase++;
                    food.create();
                }
            });
        })
    }

    this.update = () => {

        if(game.status != 'playing') return;

        snakeColision();
        snakeAteFood();

    }

}