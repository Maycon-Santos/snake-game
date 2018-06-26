//=require game/*.js

var game = new Game();

io.on('connection', socket => {

    var multiplayerLocalAllow = false;

    socket.on('login', data => {

        if(game.playersInTheRoom.length && !multiplayerLocalAllow) return;

        let id = game.playersInTheRoom.length;

        let player = {
            id: socket.id,
            
            playerProps: {
                nickname: data.playerNickname,
                bodyStart: newBodyStart(game.playersInTheRoom.length),
                color: 0
            }
        }

        game.playersInTheRoom.push(player);

        socket.emit('logged', {
            myID: socket.id,
            players: game.playersInTheRoom,
            gameProps: gameProps
        });

        socket.broadcast.emit('newPlayer', player);

        socket.on('disconnect', () => {
            delete game.playersInTheRoom[id];
            game.playersInTheRoom = game.playersInTheRoom.filter(Boolean);
            io.emit('delPlayer', id);
        });

        socket.on('changeColor', color => {
            if(color > 0 && color < gameProps.snakes.colors.length){
                player.playerProps.color = color;
                io.emit(`snakeUpdate-${socket.id}`, {color: color});
                io.emit(`playersInTheRoomUpdate`, {i: id, color: color});
            }
        });

        socket.on('single player', () => {

            io.emit('start');
    
            socket.on('start', () => {
                game.newGame();
    
                socket.on(`moveTo`, moveTo => 
                    eventEmitter.emit(`moveTo-${socket.id}`, moveTo));
            });
            
        });

        socket.on('multiplayer', () => {

            for (let i = 0; i < 8; i++) {

                if(i == game.playersInTheRoom[0].color) continue;
                
                let player = {
                    id: socket.id,
                    
                    playerProps: {
                        nickname: `Player ${game.playersInTheRoom.length + 1}`,
                        bodyStart: newBodyStart(game.playersInTheRoom.length),
                        color: 0
                    }
                }
        
                game.playersInTheRoom.push(player);

                socket.broadcast.emit('newPlayer', player);
                
            }

        });
    
    });

});