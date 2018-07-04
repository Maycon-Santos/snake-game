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
            if(io.engine.clientsCount == 0){
                game.playersInTheRoom = [];
                game.clear();
            }else{
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

        socket.on('prepare single player', nPlayers => {

            if(game.playersInTheRoom.length && game.multiplayerLocalAllow)
                return;

            game.playersInTheRoom = [game.playersInTheRoom[0]];
            io.emit('prepare', game.createPlayers(nPlayers));

        });

        socket.on('prepare multiplayer', data => {

            if(game.playersInTheRoom.length && game.multiplayerLocalAllow)
                return;

            game.playersInTheRoom = [game.playersInTheRoom[0]];

            if(game.colorsInUse.includes(data.color)) return;

            let players = [];

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

            players = [...players, ...game.createPlayers(data.nPlayers)];

            io.emit('prepare', players);
            
        });

        socket.on('multiplayer-local-allow', () => {

            game.multiplayerLocalAllow = true;
            game.readyPlayers = 0;

            socket.on('disconnect', () =>
                game.multiplayerLocalAllow = false);

            socket.emit('multiplayer-local-address', `${internalIp.v4.sync()}:${server.address().port}`);

        });

        socket.on('ready', () => {

            game.readyPlayers++;

            if(game.readyPlayers == game.playersInTheRoom.length && game.playersInTheRoom.length > 1){
                io.emit('start');
                game.newGame();
            }

            socket.on('disconnect', () => game.readyPlayers--);

        });
    
    });

});