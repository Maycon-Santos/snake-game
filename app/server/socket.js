//=require game/*.js

var game = new Game();

io.on('connection', socket => {

    var multiplayerLocalAllow = false;

    socket.on('login', data => {

        if(game.playersInTheRoom.length && !multiplayerLocalAllow) return;

        let iterator = game.playersInTheRoom.length;

        let player = {
            id: socket.id,
            nickname: data.playerNickname,
            bodyStart: newBodyStart(game.playersInTheRoom.length),
            color: 0
        }

        socket.emit('logged', {
            myID: player.id,
            player: player,
            playersInTheRoom: game.playersInTheRoom,
            gameProps: gameProps
        });

        game.playersInTheRoom.push(player);
        socket.broadcast.emit('newPlayer', player);

        socket.on('disconnect', () => {
            delete game.playersInTheRoom[iterator];
            game.playersInTheRoom = game.playersInTheRoom.filter(Boolean);
            io.emit('delPlayer', iterator);
        });

        socket.on('changeColor', color => {
            if(color > 0 && color < gameProps.snakes.colors.length){
                player.color = color;
                io.emit(`snakeUpdate-${player.id}`, {color: color});
                io.emit(`playersInTheRoom update`, {i: iterator, color: color});
            }
        });

        socket.on('single player', () => {

            io.emit('start');
    
            game.newGame();

            socket.on(`moveTo`, data => 
                eventEmitter.emit(`moveTo-${data.id}`, data.moveTo));
            
        });

        socket.on('prepare multiplayer', data => {

            let players = [];

            let player2 = {
                id: socket.id+'[1]',
                idLocal: 1,
                nickname: data.playerNickname || 'Player 2',
                bodyStart: newBodyStart(game.playersInTheRoom.length),
                color: data.color
            }

            game.playersInTheRoom.push(player2);
            players.push(player2);

            for (let i = 0; i < data.nPlayers; i++) {

                if(i == game.playersInTheRoom[0].color) continue;
                
                let player = {
                    id: `comp-${i}`,
                    nickname: `Player ${game.playersInTheRoom.length + 1}`,
                    bodyStart: newBodyStart(game.playersInTheRoom.length),
                    color: 0
                }
        
                game.playersInTheRoom.push(player);
                players.push(player);
                
            }

            io.emit('prepare multiplayer', players);
            
        });

        socket.on('multiplayer', () => {
            io.emit('start');

            game.newGame();

            socket.on(`moveTo`, moveTo =>
                eventEmitter.emit(`moveTo-${socket.id}`, moveTo));
    
        });
    
    });

});