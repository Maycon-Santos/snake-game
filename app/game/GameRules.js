function GameRules(game){

    game.engine.add(this);

    this.deathCounter = 0;

    const snakeColision = () => {

        game.for('players', (player, id) => {

            if(player.killed) return;

            let playerHead = player.head; // For performance. Accessing an object several times is heavy

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
    
    }

    const snakeAteFood = () => {
        game.for('foods', food => {
            game.for('players', player => {
                if(player.head.isEqual(food.position)){

                    player.increase++;

                    const powerup = food.type.powerup || null;

                    if(powerup && powerups[powerup])
                        powerups[powerup](player, game);
                        
                    food.create();
                    game.event.emit('foodEated', food.id);

                }
            });
        })
    }

    this.update = () => {

        if(game.status != 'playing') return;

        snakeColision();

        game.for('players', player => {
            if(!player || player.killed) return;
             // Kill the player if collided
            player.killed = player.collided;
        });

        snakeAteFood();

    }

}