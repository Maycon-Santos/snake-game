"use strict";function _toConsumableArray(e){if(Array.isArray(e)){for(var r=0,o=Array(e.length);r<e.length;r++)o[r]=e[r];return o}return Array.from(e)}Array.prototype.isEqual=function(e){return JSON.stringify(this)===JSON.stringify(e)},Array.prototype.sumWith=function(){for(var e=arguments.length,r=Array(e),o=0;o<e;o++)r[o]=arguments[o];r=[this].concat(_toConsumableArray(r)).sort(function(e,r){return r.length-e.length});for(var a=[].concat(_toConsumableArray(r[0])),t=1,n=r.length;t<n;t++)for(var l=r[t],i=0,s=l.length;i<s;i++){var m=l[i];a[i]+=m}return a},Array.prototype.sumAll=function(){return this.reduce(function(e,r){return e+r},0)},Array.prototype.lastItem=function(){return this[this.length-1]},Array.prototype.includesArr=function(e){for(var r=this.length-1;0<=r;r--)if(this[r].isEqual(e))return!0},Array.prototype.shuffle=function(){for(var e=[],r=0,o=this.length;r<o;r++)e.push(this.splice(Math.floor(Math.random()*this.length),1)[0]);return e.push(this[0]),e},Array.prototype.clear=function(){this.length=0},Number.prototype.isEqual=function(){for(var e=arguments.length,r=Array(e),o=0;o<e;o++)r[o]=arguments[o];for(var a=0,t=r.length;a<t;a++)if(this==r[a])return!0;return!1},Object.prototype.merge=function(e){for(var r in e)this[r]=e[r]};var electron=require("electron"),events=require("events"),express=require("express"),app=express(),internalIp=require("internal-ip"),server=app.listen(5300);app.use(express.static("dist/static/")),electron.app.on("ready",function(){var e=new electron.BrowserWindow({minWidth:800,minHeight:480,width:1024,height:720,icon:__dirname+"/icons/64x64.ico"});e.webContents.openDevTools(),app.use(express.static("static")),e.loadURL("http://localhost:"+server.address().port)}),electron.app.on("window-all-closed",function(){electron.app.quit()});var game=new Game,io=require("socket.io")(server);io.on("connection",function(a){game.roomCreator||(game.roomCreator=a.id),a.on("disconnect",function(){a.id==game.roomCreator&&(game.status="toStart",game.roomCreator=void 0,game.playersInTheRoom.length=0,game.clear(),io.emit("multiplayer-local deny"))}),a.on("login",function(e){if(game.roomCreator!=a.id&&!game.multiplayerLocalAllow)return a.emit("multiplayer disabled");if("playing"==game.status)return a.emit("is playing");var r=game.playersInTheRoom.length,o={id:a.id,enhancerId:r,nickname:e.playerNickname,bodyStart:newBodyStart(game.playersInTheRoom.length)};a.emit("logged",{myID:o.id,multiplayerLocal:game.multiplayerLocalAllow,player:o,playersInTheRoom:game.playersInTheRoom,gameProps:gameProps}),game.playersInTheRoom.push(o),a.broadcast.emit("new player",o),a.on("disconnect",function(){a.id!=game.roomCreator&&(game.readyPlayers=0,game.playersInTheRoom.splice(r,1),io.emit("delete player",r),"playing"==game.status&&(game.players[r].killed=!0))}),a.on("change color",function(e){if(game.colorsInUse.includes(e))return a.emit("color in use");a.emit("color not in use"),0<=e&&e<gameProps.snakes.colors.length&&(o.color=e,io.emit("playersInTheRoom update",{i:r,color:e}))}),a.on("start",function(){game.playersInTheRoom.length&&!game.multiplayerLocalAllow&&game.roomCreator!=a.id||(io.emit("start"),game.start())}),a.on("moveTo",function(e){return game.event.emit("moveTo",e)}),a.on("prepare single-player",function(e){game.playersInTheRoom.length&&game.multiplayerLocalAllow||io.emit("prepare game",game.createPlayers(e))}),a.on("prepare multiplayer",function(e){if(!game.playersInTheRoom.length||!game.multiplayerLocalAllow){if(game.colorsInUse.includes(e.color))return a.emit("color in use");var r=[],o={id:a.id+"[1]",idLocal:1,enhancerId:game.playersInTheRoom.length,nickname:e.nickname||"Player 2",bodyStart:newBodyStart(game.playersInTheRoom.length),color:e.color};game.playersInTheRoom.push(o),r.push(o),r=[].concat(_toConsumableArray(r),_toConsumableArray(game.createPlayers(e.nPlayers))),io.emit("prepare game",r)}}),a.on("multiplayer-local allow",function(){game.roomCreator==a.id&&(game.multiplayerLocalAllow=!0,game.readyPlayers=0,a.on("disconnect",function(){return game.multiplayerLocalAllow=!1}),a.emit("multiplayer-local address",internalIp.v4.sync()+":"+server.address().port))}),a.on("multiplayer-local deny",function(){game.roomCreator==a.id&&(game.multiplayerLocalAllow=!1,a.broadcast.emit("multiplayer-local deny"))}),a.on("ready",function(){io.emit("teste",game.playersInTheRoom),game.readyPlayers<0&&(game.readyPlayers=0),game.readyPlayers++,game.readyPlayers==game.playersInTheRoom.length&&1<game.playersInTheRoom.length&&(io.emit("start"),game.start()),a.on("disconnect",function(){return game.readyPlayers--})}),a.on("logout",function(){return a.disconnect()})})});