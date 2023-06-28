"use strict";var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};function _toConsumableArray(e){if(Array.isArray(e)){for(var t=0,r=Array(e.length);t<e.length;t++)r[t]=e[t];return r}return Array.from(e)}Array.prototype.isEqual=function(e){return JSON.stringify(this)===JSON.stringify(e)},Array.prototype.sumWith=function(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];t=[this].concat(_toConsumableArray(t)).sort(function(e,t){return t.length-e.length});for(var o=[].concat(_toConsumableArray(t[0])),n=1,a=t.length;n<a;n++)for(var i=t[n],s=0,l=i.length;s<l;s++){var u=i[s];o[s]+=u}return o},Array.prototype.sumAll=function(){return this.reduce(function(e,t){return e+t},0)},Array.prototype.lastItem=function(){return this[this.length-1]},Array.prototype.includesArr=function(e){for(var t=this.length-1;0<=t;t--)if(this[t].isEqual(e))return!0},Array.prototype.shuffle=function(){for(var e=[],t=0,r=this.length;t<r;t++)e.push(this.splice(Math.floor(Math.random()*this.length),1)[0]);return e.push(this[0]),e},Array.prototype.clear=function(){this.length=0},Number.prototype.isEqual=function(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];for(var o=0,n=t.length;o<n;o++)if(this==t[o])return!0;return!1},Object.prototype.merge=function(e){for(var t in e)this[t]=e[t]};var electron=require("electron"),events=require("events"),express=require("express"),app=express(),internalIp=require("internal-ip"),server=app.listen(5300);app.use(express.static("dist/static/")),electron.app.on("ready",function(){var e=new electron.BrowserWindow({minWidth:800,minHeight:480,width:1024,height:720,icon:__dirname+"/icons/64x64.ico"});e.webContents.openDevTools(),app.use(express.static("static")),e.loadURL("http://localhost:"+server.address().port)}),electron.app.on("window-all-closed",function(){electron.app.quit()});var powerups=new function(){var r=this,a={};this.on=function(e,t){a[e]||(a[e]=[]),a[e].push(t),r[e]=function(n){return function(e,t){for(var r=0,o=a[n].length;r<o;r++)a[n][r](e,t)}}(e)}};function Engine(){var o=[],n={};this.run=function(){var r=Date.now();setInterval(function(){var e=Date.now(),t=(e-r)/1e3;1<=(t=Math.min(1,t))&&(r=e),function(e){for(var t=o.length;t--;)"function"==typeof o[t].update&&o[t].update(e)}(t),Object.keys(n).length&&(io.emit("update",n),n={})},0)},this.add=function(e){return o.push(e)},this.sendUpdate=function(e,t,r){n[e]||(n[e]=[]),n[e][t]||(n[e][t]={}),n[e][t]=Object.assign(n[e][t],r)},this.clear=function(){return o=[]}}function Food(t,e){var r=this;this.id=e;var o=[];for(var n in this.type,this.position=[],t.engine.add(this),gameProps.foods.types)for(var a=gameProps.foods.types[n],i=a.chance,s=0;s<i;s++)o.push(a);this.senUpdate=function(e){return t.engine.sendUpdate("foods",r.id,e)},this.create=function(){var e=Math.round(Math.random()*(o.length-1));this.type=o[e],this.position=[[],[]].map(function(e,t){return Math.round(Math.random()*(gameProps.tiles[t]-1))}),this.senUpdate({position:this.position,color:this.type.color})},this.create()}function Game(){var e,r=this,t="toStart";Object.defineProperties(this,{playersInTheRoom:{value:[],writable:!1},players:{value:[],writable:!1},foods:{value:[],writable:!1},roomCreator:{writable:!0},multiplayerLocalAllow:{value:!1,writable:!0},readyPlayers:{value:0,writable:!0},colorsInUse:{get:function(){var t=[];return r.for("playersInTheRoom",function(e){return t.push(e.color)}),t}},winner:{get:function(){var t;return r.for("players",function(e){e.killed||(t=e)}),t}},status:{get:function(){return t},set:function(e){"over"==e&&(r.multiplayerLocalAllow||(game.playersInTheRoom.length=1),io.emit("game over",r.winner),r.clear(),r.gameRules.close(),r.clear()),t=e}},gameRules:{value:{get take(){return e},init:function(){return e=new GameRules(r)},close:function(){return e=void 0}},writable:!1}}),Object.defineProperty(this,"engine",{value:new Engine(this),writable:!1}),this.engine.run()}function GameRules(i){i.engine.add(this),this.deathCounter=0;this.update=function(){"playing"==i.status&&(i.for("players",function(o,n){if(!o.killed){for(var a=o.head,e=o.body.length-1;0<=e;e--)if(0<e&&o.body[e].isEqual(a))return o.collided=!0;o.collided||i.for("players",function(e,t){if(n!=t&&!e.killed)for(var r=e.body.length-1;0<=r;r--)if(e.body[r].isEqual(a))return o.collided=!0})}}),i.for("players",function(e){e&&!e.killed&&(e.killed=e.collided)}),i.for("foods",function(r){i.for("players",function(e){if(e.head.isEqual(r.position)){e.increase++;var t=r.type.powerup||null;t&&powerups[t]&&(powerups[t](e,i),io.emit("show powerup",t)),r.create(),i.event.emit("foodEated",r.id)}})}))}}function Snake(o,e){var d=this;this.id=null,this.enhancerId=null,this.body=[],this.increase=0,this.superSpeed=0,this.superSlow=0,this.freeze=0,this.collided=!1,this.bodyStart=[0,0],this.AI=!1,this.merge(e),this.directionMap={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1],"-1":"left",1:"right","-2":"up",2:"down"};var n=gameProps.snakes.initialDirection;Object.defineProperty(this,"direction",{get:function(){return n},set:function(e){var t=Object.keys(d.directionMap),r=n,o=gameProps.snakes.reverse;t.includes(e)&&(n=e),s().isEqual(d.body[1])&&(o?(n=d.tailDirection,d.body.reverse()):n=r)}}),Object.defineProperties(this,{head:{get:function(){return d.body[0]}},tail:{get:function(){return d.body[d.body.length-1]}},tailDirection:{get:function(){var e=d.body[d.body.length-2],t=d.tail;return t[0]>e[0]?"right":t[0]<e[0]?"left":t[1]>e[1]?"down":t[1]<e[1]?"up":void 0}}});var t=!1;Object.defineProperty(this,"killed",{get:function(){return t},set:function(e){e!=t&&(t=!!e,d.senUpdate({killed:t}),t&&o.gameRules.take.deathCounter++,o.gameRules.take.deathCounter>=o.players.length-1&&(o.status="over"))}}),Object.defineProperty(this,"bodyVertices",{get:function(){for(var r,o=[[d.body[0]]],n=d.body[0],e=1,t=d.body.length;e<t;e++){var a=d.body[e];a.map(function(e,t){e==n[t]&&(r?r!=t&&(o.push([]),r=t):r=t)}),o.lastItem().push(a),n=a}return o}}),Object.defineProperty(this,"verticesDirections",{get:function(){for(var e=d.head,t=d.bodyVertices,r=[],o=1,n=t.length;o<n;o++){var a=t[o];e:for(var i=0,s=a.length;i<s;i++)for(var l=a[i],u=0,c=l.length;u<c;u++)if(e[u]==l[u]){var p=Math.abs(u-1);e[p]<l[p]?r.push(d.directionMap[1*(p+1)]):r.push(d.directionMap[-1*(p+1)]);break e}}return r}}),this.senUpdate=function(e){return o.engine.sendUpdate("players",d.enhancerId,e)},o.engine.add(this);var a=new SnakeControls(this,o);this.newBody(),this.AI&&(this.AI=new snakeAI(o,this));var i=0,s=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:1,t=d.directionMap[d.direction],r=Math.abs(t[1]),o=[].concat(_toConsumableArray(d.body[0]));return o[r]+=t[r]*e,o[r]>=gameProps.tiles[r]?o[r]=0:o[r]<0&&(o[r]=gameProps.tiles[r]-1),o};this.update=function(e){d.body.length&&!d.killed&&function(e){if("playing"==o.status){var t=gameProps.snakes.speed;0<d.superSpeed&&(t*=1.4),0<d.superSlow&&(t*=.5);var r=e*t;r<i&&(i=0),~~r<=~~i||(d.AI?d.AI.movement():a.currentMovement(),i=t<=r?0:r,d.freeze<=0&&(d.body.splice(0,0,s()),d.increase<1?d.body.pop():d.increase--),d.superSpeed&&d.superSpeed--,d.superSlow&&d.superSlow--,d.freeze&&d.freeze--,d.senUpdate({body:d.body}))}}(e)}}function SnakeControls(t,e){var r=[];e.event.on("moveTo",function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{id:id,moveTo:moveTo};e.id==t.id&&e.moveTo!=r.lastItem()&&r.push(e.moveTo)}),this.currentMovement=function(){(r=r.filter(Boolean)).length&&(t.direction=r[0],r&&r.splice(0,1))}}powerups.on("freeze",function(t,e){e.for("players",function(e){e.enhancerId!=t.enhancerId&&(e.freeze+=10)})}),powerups.on("super increase",function(e){return e.increase+=5}),powerups.on("super slow",function(t,e){e.for("players",function(e){e.enhancerId!=t.enhancerId&&(e.superSlow+=50)})}),powerups.on("super speed",function(e){return e.superSpeed+=50}),Game.prototype.event=new events.EventEmitter,Game.prototype.clear=function(){this.players.clear(),this.foods.clear(),this.readyPlayers=0,this.engine.clear()},Game.prototype.start=function(){var e=this;this.gameRules.init(),this.addFoods(),this.addPlayers();function t(){io.emit("countdown",r),r--}var r=3;t();var o=setInterval(function(){if(r<1)return e.status="playing",clearInterval(o);t()},1e3)},Game.prototype.for=function(e,t){if("object"==(void 0===e?"undefined":_typeof(e)))for(var r=0,o=e.length;r<o&&0!=t(e[r],r);r++);else for(var n=0,a=this[e].length;n<a&&0!=t(this[e][n],n);n++);},Game.prototype.addPlayers=function(){var t=this;this.for("playersInTheRoom",function(e){return t.players.push(new Snake(t,e))})},Game.prototype.addFoods=function(){for(var e=0;e<gameProps.foods.qnt;e++){var t=new Food(this,this.foods.length);this.foods.push(t)}},Game.prototype.generateColor=function(){var e=Math.round(Math.random()*(gameProps.snakes.colors.length-1));return this.colorsInUse.includes(e)?this.generateColor():e},Game.prototype.createPlayers=function(e){for(var t=[],r=0;r<e;r++){var o={id:"comp-"+r,enhancerId:this.playersInTheRoom.length,AI:!0,nickname:"Computer "+(r+1),bodyStart:newBodyStart(this.playersInTheRoom.length),color:this.generateColor()};this.playersInTheRoom.push(o),t.push(o)}return io.emit("teste",this.playersInTheRoom),t};var gameProps={tiles:[64,36],snakes:{speed:15,initialSize:1,initialDirection:"right",reverse:!(Snake.prototype.newBody=function(){var e=this.bodyStart,t=[e[0],e[1]],r=e[2];this.body=[t];for(var o=gameProps.snakes.initialSize,n=1;n<o;n++){this.body.push([]);var a=[].concat(t);switch(r){case"right":case"left":a[0]="right"==r?t[0]+n:t[0]-n;break;case"up":case"down":a[1]="down"==r?t[1]+n:t[1]-n}for(var i=0;i<=1;i++)a[i]<0&&(a[i]=gameProps.tiles[i]-Math.abs(a[i])),a[i]>=gameProps.tiles[i]&&(a[i]=a[i]-gameProps.tiles[i]),this.body[n].push(a[i])}this.senUpdate({body:this.body})}),sensibilityTouch:30,keyMaps:[{left:"ArrowLeft",right:"ArrowRight",up:"ArrowUp",down:"ArrowDown"},{left:"a",right:"d",up:"w",down:"s"}],colors:["#000000","DimGray","HotPink","Brown","DarkBlue","RosyBrown","Chocolate","AliceBlue","Goldenrod"]},foods:{qnt:1,types:{normal:{chance:30,color:"#FFE400"},superSlow:{chance:3,color:"#af3907",powerup:"super slow"},superSpeed:{chance:3,color:"#0f8660",powerup:"super speed"},superIncrease:{chance:3,color:"#29002d",powerup:"super increase"},freeze:{chance:0,color:"#076f96",powerup:"freeze"},invisible:{chance:0,color:"#a607af"}}}},newBodyStart=function(e){e++;var t=Math.round(e/3.0001%1*3),r=Math.ceil(e/3);return io.emit("teste",t),[16*t,9*r,"down"]};function snakeAI(u,c){function t(){var e=u.foods;return e[Math.round(Math.random()*(e.length-1))]}var l,r=t();u.event.on("foodEated",function(e){r.id==e&&(r=t(),l=void 0)});function o(){var r=["left","right","up","down"],o=c.direction,n=c.verticesDirections,a=function(){var s=[],r=c.enhancerId,l=c.head;return u.for("players",function(e,t){return e.killed||r==t?null:u.for(e.body,function(i){return u.for(i,function(e,t){var r=1==t?0:1;if(i[t].isEqual(l[t])){var o=l[r]-i[r],n=Math.abs(o);if(n<=5){var a=-(o/n)*(1+r);s.push(c.directionMap[a])}}})})}),s.concat(c.verticesDirections)}();return u.for(r,function(e,t){if(!a.includes(e)&&!n.includes(e)){if(i(e)!=i(o))return;if(o==e)return}r[t]=null}),r}var i=function(e){return"left"==e||"right"==e?"horizontal":"vertical"};this.movement=function(){null==l&&(l=Math.round(Math.random()));var e=function(n){var a=[],i=c.head,s=r.position;return u.for(s,function(e,t){var r=t;s[t]>i[t]&&r++;var o=n.splice(r,1)[0];l==t&&t!=r&&(t<r?1==r?"left"==c.direction&&(l=1):2==r&&"up"==c.direction&&(l=0):0==r?"right"==c.direction&&(l=1):1==r&&"down"==c.direction&&(l=1)),t==l&&s[t]!=i[t]&&a.push(o),t!=l&&s[l]==i[l]&&a.push(o)}),a.concat(n.shuffle()).filter(Boolean)}(o());c.direction=e[0]}}var game=new Game,io=require("socket.io")(server);io.on("connection",function(o){game.roomCreator||(game.roomCreator=o.id),o.on("disconnect",function(){o.id==game.roomCreator&&(game.status="toStart",game.roomCreator=void 0,game.playersInTheRoom.length=0,game.clear(),io.emit("multiplayer-local deny"))}),o.on("login",function(e){if(game.roomCreator!=o.id&&!game.multiplayerLocalAllow)return o.emit("multiplayer disabled");if("playing"==game.status)return o.emit("is playing");var t=game.playersInTheRoom.length,r={id:o.id,enhancerId:t,nickname:e.playerNickname,bodyStart:newBodyStart(game.playersInTheRoom.length)};o.emit("logged",{myID:r.id,multiplayerLocal:game.multiplayerLocalAllow,player:r,playersInTheRoom:game.playersInTheRoom,gameProps:gameProps}),game.playersInTheRoom.push(r),o.broadcast.emit("new player",r),o.on("disconnect",function(){o.id!=game.roomCreator&&(game.readyPlayers=0,game.playersInTheRoom.splice(t,1),io.emit("delete player",t),"playing"==game.status&&(game.players[t].killed=!0))}),o.on("change color",function(e){if(game.colorsInUse.includes(e))return o.emit("color in use");o.emit("color not in use"),0<=e&&e<gameProps.snakes.colors.length&&(r.color=e,io.emit("playersInTheRoom update",{i:t,color:e}))}),o.on("start",function(){game.playersInTheRoom.length&&!game.multiplayerLocalAllow&&game.roomCreator!=o.id||(io.emit("start"),game.start())}),o.on("moveTo",function(e){return game.event.emit("moveTo",e)}),o.on("prepare single-player",function(e){game.playersInTheRoom.length&&game.multiplayerLocalAllow||io.emit("prepare game",game.createPlayers(e))}),o.on("prepare multiplayer",function(e){if(!game.playersInTheRoom.length||!game.multiplayerLocalAllow){if(game.colorsInUse.includes(e.color))return o.emit("color in use");var t=[],r={id:o.id+"[1]",idLocal:1,enhancerId:game.playersInTheRoom.length,nickname:e.nickname||"Player 2",bodyStart:newBodyStart(game.playersInTheRoom.length),color:e.color};game.playersInTheRoom.push(r),t.push(r),t=[].concat(_toConsumableArray(t),_toConsumableArray(game.createPlayers(e.nPlayers))),io.emit("prepare game",t)}}),o.on("multiplayer-local allow",function(){game.roomCreator==o.id&&(game.multiplayerLocalAllow=!0,game.readyPlayers=0,o.on("disconnect",function(){return game.multiplayerLocalAllow=!1}),o.emit("multiplayer-local address",internalIp.v4.sync()+":"+server.address().port))}),o.on("multiplayer-local deny",function(){game.roomCreator==o.id&&(game.multiplayerLocalAllow=!1,o.broadcast.emit("multiplayer-local deny"))}),o.on("ready",function(){io.emit("teste",game.playersInTheRoom),game.readyPlayers<0&&(game.readyPlayers=0),game.readyPlayers++,game.readyPlayers==game.playersInTheRoom.length&&1<game.playersInTheRoom.length&&(io.emit("start"),game.start()),o.on("disconnect",function(){return game.readyPlayers--})}),o.on("logout",function(){return o.disconnect()})})});