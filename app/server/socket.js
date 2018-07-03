//=require game/*.js

io.on('connection', socket => {

    socket.on('login', data => {

        if(game.playersInTheRoom.length && !game.multiplayerLocalAllow)
            return socket.emit('multiplayer disabled');

        let enhancerId = game.playersInTheRoom.length;

        let player = {
            id: socket.id,
            enhancerId: enhancerId,
            nickname: data.playerNickname,
            bodyStart: newBodyStart(game.playersInTheRoom.length)
        }

        socket.emit('logged', {
            myID: player.id,
            multiplayerLocal: game.multiplayerLocalAllow,
            player: player,
            playersInTheRoom: game.playersInTheRoom,
            gameProps: gameProps
        });

        game.playersInTheRoom.push(player);
        socket.broadcast.emit('newPlayer', player);

        socket.on('disconnect', () => {
            if(io.engine.clientsCount == 1)
                game.playersInTheRoom = [];
            else{
                delete game.playersInTheRoom[enhancerId];
                game.playersInTheRoom = game.playersInTheRoom.filter(Boolean);
                io.emit('delPlayer', enhancerId);
            }
        });

        socket.on('changeColor', color => {

            let colorsInUse = game.colorsInUse;
            if(colorsInUse.includes(color)) return;

            if(color >= 0 && color < gameProps.snakes.colors.length){
                player.color = color;
                io.emit(`snakeUpdate-${socket.id}`, {color: color});
                io.emit(`playersInTheRoom update`, {i: enhancerId, color: color});
            }

        });

        socket.on('start', () => {

            if(game.playersInTheRoom.length && !game.multiplayerLocalAllow){
                if(socket.id != game.playersInTheRoom[0].id) return;
            }

            io.emit('start');
            game.newGame();

        });

        socket.on('moveTo', data => game.event.emit('moveTo', data));

        socket.on('prepare multiplayer', data => {

            if(game.playersInTheRoom.length && game.multiplayerLocalAllow)
                return;

            let players = [];
            let colorsInUse = game.colorsInUse;

            if(colorsInUse.includes(data.color)) return;

            let player2 = {
                id: `${socket.id}[1]`,
                idLocal: 1,
                enhancerId: game.playersInTheRoom.length,
                nickname: data.nickname || 'Player 2',
                bodyStart: newBodyStart(game.playersInTheRoom.length),
                color: data.color
            }

            game.playersInTheRoom.push(player2);
            players.push(player2);

            for (let i = 0; i < data.nPlayers; i++) {

                if(i == game.playersInTheRoom[0].color) continue;
                
                let player = {
                    id: `comp-${i}`,
                    enhancerId: game.playersInTheRoom.length,
                    nickname: `Player ${game.playersInTheRoom.length + 1}`,
                    bodyStart: newBodyStart(game.playersInTheRoom.length),
                    color: game.generateColor()
                }
        
                game.playersInTheRoom.push(player);
                players.push(player);
                
            }

            io.emit('prepare multiplayer', players);
            
        });

        socket.on('multiplayer-local-allow', () =>
            game.multiplayerLocalAllow = true);
    
    });

});