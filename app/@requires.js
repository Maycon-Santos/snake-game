const electron = require('electron');
const express = require('express');
const app = express();
const port = 8000;
const server = app.listen(port);

app.use(express.static('static'));

const io = require('socket.io')(server);

var mainWindow;