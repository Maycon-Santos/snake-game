const electron = require('electron');
const express = require('express');
const app = express();
const port = 8000;
const server = app.listen(port);

app.use(express.static('static'));

const io = require('socket.io')(server);

app.get('/', (req, res) => res.sendFile(__dirname + '/app/index.html'));

var mainWindow;

/*
====================================
====================================
*/

var players = [];
electron.app.on('ready', () => {

    mainWindow = new electron.BrowserWindow({
        width: 1024,
        height: 720
    });

    mainWindow.setMenuBarVisibility(false);

    mainWindow.webContents.openDevTools();

    app.use(express.static('static'));
    
    mainWindow.loadURL(`http://localhost:${port}`);

});

electron.app.on('window-all-closed', () => {
    electron.app.quit();
});
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