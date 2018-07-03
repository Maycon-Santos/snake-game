//=require utils/*.js

const electron = require('electron');
const events = require('events');
const express = require('express');
const app = express();
const internalIp = require('internal-ip');
const server = app.listen(0);

var game = new Game();

app.use(express.static('static'));

const io = require('socket.io')(server);

var mainWindow;