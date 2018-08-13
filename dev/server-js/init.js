//=require game/**/*.js

const game = new Game(),
      io = require('socket.io')(server);

io.on('connection', socket => {

    if(!game.roomCreator) game.roomCreator = socket.id;

    socket.on('disconnect', () => {
        if(socket.id == game.roomCreator){
            game.status = 'toStart';
            game.roomCreator = undefined;
            game.playersInTheRoom.length = 0;
            game.clear();
            io.emit('multiplayer-local deny');
        }
    });

    socket.on('login', data => {

        if(game.roomCreator != socket.id && !game.multiplayerLocalAllow)
            return socket.emit('multiplayer disabled');

        if(game.status == 'playing')
            return socket.emit('is playing');

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
        socket.broadcast.emit('new player', player);

        socket.on('disconnect', () => {
            if(socket.id != game.roomCreator){
                game.readyPlayers = 0;
                game.playersInTheRoom.splice(enhancerId, 1);
                io.emit('delete player', enhancerId);
                if(game.status == 'playing'){
                    game.players[enhancerId].killed = true;
                }
            }
        });

        socket.on('change color', color => {

            if(game.colorsInUse.includes(color))
                return socket.emit('color in use');
            else socket.emit('color not in use');

            if(color >= 0 && color < gameProps.snakes.colors.length){
                player.color = color;
                io.emit(`playersInTheRoom update`, {i: enhancerId, color: color});
            }

        });

        socket.on('start', () => {

            if(game.playersInTheRoom.length && !game.multiplayerLocalAllow){
                if(game.roomCreator != socket.id) return;
            }

            io.emit('start');
            game.start();

        });

        socket.on('moveTo', data => game.event.emit('moveTo', data));

        socket.on('prepare single-player', nPlayers => {

            if(game.playersInTheRoom.length && game.multiplayerLocalAllow)
                return;

            io.emit('prepare game', game.createPlayers(nPlayers));

        });

        socket.on('prepare multiplayer', data => {

            if(game.playersInTheRoom.length && game.multiplayerLocalAllow)
                return;

            if(game.colorsInUse.includes(data.color))
                return socket.emit('color in use');

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

            io.emit('prepare game', players);
            
        });

        socket.on('multiplayer-local allow', () => {

            if(game.roomCreator != socket.id) return;

            game.multiplayerLocalAllow = true;
            game.readyPlayers = 0;

            socket.on('disconnect', () =>
                game.multiplayerLocalAllow = false);

            socket.emit('multiplayer-local address', `${internalIp.v4.sync()}:${server.address().port}`);

        });

        socket.on('multiplayer-local deny', () => {

            if(game.roomCreator != socket.id) return;

            game.multiplayerLocalAllow = false;

            socket.broadcast.emit('multiplayer-local deny');

        });

        socket.on('ready', () => {

            io.emit('teste', game.playersInTheRoom);

            if(game.readyPlayers < 0) game.readyPlayers = 0;
            game.readyPlayers++;

            if(game.readyPlayers == game.playersInTheRoom.length && game.playersInTheRoom.length > 1){
                io.emit('start');
                game.start();
            }

            socket.on('disconnect', () => game.readyPlayers--);

        });

        socket.on('logout', () => socket.disconnect());
    
    });

});