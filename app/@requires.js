//=require utils/*.js

const electron = require('electron');
const events = require('events');
const express = require('express');
const app = express();
const port = 5000;
const server = app.listen(port);

const eventEmitter = new events.EventEmitter();

app.use(express.static('static'));

const io = require('socket.io')(server);

var mainWindow;