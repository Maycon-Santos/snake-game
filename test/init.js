Array.prototype.isEqual = function(arr){
    return JSON.stringify(this) === JSON.stringify(arr);
}

Array.prototype.sumWith = function(...arrays){
    var arrays = [this, ...arrays].sort((a, b) => b.length - a.length), // Order by DESC
        newArray = [...arrays[0]]; // Largest array of the list

    for (let i = 1, arrLeng = arrays.length; i < arrLeng; i++) {
        const array = arrays[i];
        for (let j = 0, itemLeng = array.length; j < itemLeng; j++) {
            const item = array[j];
            newArray[j] += item;
        }
    }

    return newArray;
}

Array.prototype.sumAll = function(){
    return this.reduce((total, sum) => total + sum, 0);
}

Array.prototype.lastItem = function(){
    return this[this.length - 1];
}

Array.prototype.includesArr = function(arr){

    for (let i = this.length - 1; i >= 0; i--){
        if(this[i].isEqual(arr)) return true;
    }

}

Array.prototype.shuffle = function(){

    var tempArr = [];

    for ( var i = 0, L = this.length; i < L; i++ ) {
        // The following line removes one random element from arr
        // and pushes it onto tempArr
        tempArr.push(this.splice(Math.floor(Math.random() * this.length), 1)[0]);
    }

    // Push the remaining item onto tempArr
    tempArr.push(this[0]);
    return tempArr;

}

Array.prototype.clear = function(){
    this.length = 0;
}
Number.prototype.isEqual = function(...values){

    for(let i = 0, L = values.length; i < L; i++){

        if(this == values[i]) return true;

    }

    return false;

}
Object.prototype.merge = function(object){
    for (const key in object) this[key] = object[key];
}
const electron = require('electron');
const events = require('events');
const express = require('express');
const app = express();
const internalIp = require('internal-ip');
const server = app.listen(5300);

app.use(express.static('test/static/'));
electron.app.on('ready', () => {

    const mainWindow = new electron.BrowserWindow({
        minWidth: 800,
        minHeight: 480,
        width: 1024,
        height: 720,

        icon: __dirname + '/icons/64x64.ico',
    });

    // mainWindow.setMenuBarVisibility(false);

    mainWindow.webContents.openDevTools();

    app.use(express.static('static'));
    
    mainWindow.loadURL(`http://localhost:${server.address().port}`);

});

electron.app.on('window-all-closed', () => {
    electron.app.quit();
});
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