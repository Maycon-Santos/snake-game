//=require game/*.js

var game = new Game();

io.on('connection', socket => {

    var multiplayerLocalAllow = false;

    socket.on('login', data => {

        if(game.playersInTheRoom.length && !multiplayerLocalAllow) return;

        let player = {
            id: socket.id,
            nickname: data.playerNickname,

            playerProps: {
                bodyStart: newBodyStart(game.playersInTheRoom.length)
            }
        }

        game.playersInTheRoom.push(player);

        socket.emit('logged', {
            myID: socket.id,
            players: game.playersInTheRoom,
            gameProps: gameProps
        });

        socket.broadcast.emit('newPlayer', game.playersInTheRoom);
    
    });

    socket.on('single player', () => {

        socket.emit('start');

        socket.on('start', () => {
            game.newGame();

            socket.on(`moveTo`, moveTo => 
                eventEmitter.emit(`moveTo-${socket.id}`, moveTo));
        });
        
    });

});