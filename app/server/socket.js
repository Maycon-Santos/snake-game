//=require game/*.js

io.on('connection', socket => {

    var players = [],
        multiplayerLocalAllow = false;

    socket.on('login', data => {

        if(players.length && !multiplayerLocalAllow) return;

        let player = {
            id: players.length,
            nickname: data.playerNickname,

            playerProps: {
                bodyStart: newBodyStart(players.length)
            }
        }

        players.push(player);

        socket.emit('logged', {
            myID: player.id,
            players: players,
            gameProps: gameProps
        });
    
    });

    socket.on('single player', () => {
        socket.emit('start');
    });

});