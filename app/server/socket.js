//=require game/*.js

var game = new Game();

io.on('connection', socket => {

    var multiplayerLocalAllow = false;

    socket.on('login', data => {

        if(game.playersInTheRoom.length && !multiplayerLocalAllow) return;

        let iterator = game.playersInTheRoom.length;

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
            myID: player.id,
            players: game.playersInTheRoom,
            gameProps: gameProps
        });

        socket.broadcast.emit('newPlayer', player);

        socket.on('disconnect', () => {
            delete game.playersInTheRoom[iterator];
            game.playersInTheRoom = game.playersInTheRoom.filter(Boolean);
            io.emit('delPlayer', iterator);
        });

        socket.on('changeColor', color => {
            if(color > 0 && color < gameProps.snakes.colors.length){
                player.playerProps.color = color;
                io.emit(`snakeUpdate-${player.id}`, {color: color});
                io.emit(`playersInTheRoomUpdate`, {i: iterator, color: color});
            }
        });

        socket.on('single player', () => {

            io.emit('start');
    
            game.newGame();

            socket.on(`moveTo`, moveTo => 
                eventEmitter.emit(`moveTo-${player.id}`, moveTo));
            
        });

        socket.on('multiplayer', data => {

            let player2 = {
                id: socket.id+'[1]',
                
                playerProps: {
                    nickname: data.playerNickname || 'Player 2',
                    bodyStart: newBodyStart(game.playersInTheRoom.length),
                    color: data.color
                }
            }

            game.playersInTheRoom.push(player2);

            io.emit('newPlayer', player2);

            for (let i = 0; i < data.nPlayers; i++) {

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

                io.emit('newPlayer', player);
                
            }

            io.emit('start');

            socket.on('start', () => {
                game.newGame();

                socket.on(`moveTo`, moveTo =>
                    eventEmitter.emit(`moveTo-${socket.id}`, moveTo));
    
            });
            
        });
    
    });

});