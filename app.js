const electron = require('electron');
const express = require('express');
const app = express();
const port = 8000;
const server = app.listen(port);

app.use(express.static('static'));

const io = require('socket.io')(server);

var mainWindow;
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
var gameProps = {
    tiles: [64, 36], // X, Y

    snakes: {
        speed: 15,
        initialSize: 3,
        initialDirection: "right",
        reverse: false,
        sensibilityTouch: 30, // the higher, the less sensitive

        keyMaps: [
            {left: "ArrowLeft", right: "ArrowRight", up: "ArrowUp", down: "ArrowDown"},
            {left: "a", right: "d", up: "w", down: "s"}
        ],

        colors: [
            '#000000', // Black
            '#ff0000', // Red
            '#00ff00', // Green
            '#0000ff' // Blue
        ]
    },

    foods: {
        qnt: 1,

        types: {
            normal: {
                chance: 5,
                color: '#FFE400'
            },

            freezer: {
                chance: 0,
                color: '#008F30'
            },

            superSpeed: {
                chance: 0,
                color: '#008F30'
            }
        }

    }

}
const newBodyStart = id => [5 * (id+1), 5 * (id+1), 'down'];

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