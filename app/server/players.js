io.on('connection', socket => {

    socket.on('login', playerNickname => {

        players.push({
            id: players.length,
            nickname: playerNickname,
            color: '#000000'
        });
    
        socket.emit('logged', {players: players});
    
    });

});