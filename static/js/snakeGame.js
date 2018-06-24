"use strict";function Engine(o){var e=this,a=o.ctx.canvas,s=[],c=function(e){for(var t=arguments.length,n=Array(1<t?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];for(var i=s.length;i--;){var o;"function"==typeof s[i][e]&&(o=s[i])[e].apply(o,n)}};this.run=function(){var r=e,i=performance.now();requestAnimationFrame(function e(t){var n=(t-i)/1e3;if(n=Math.min(1,n),c("update",n),o.ctx.clearRect(0,0,a.width,a.height),c("draw"),1<=n)return r.run();requestAnimationFrame(e)}.bind(e))},this.add=function(e){return s.push(e)}}function Food(e){var t,n=this,r=[];for(var i in this.position=[],gameProps.foods.types)for(var o=gameProps.foods.types[i],a=o.chance,s=0;s<a;s++)r.push(o);this.create=function(){var e=Math.round(Math.random()*(r.length-1));t=r[e],this.position=[[],[]].map(function(e,t){return Math.round(Math.random()*(gameProps.tiles[t]-1))})},this.update=function(){},this.draw=function(){"playing"==e.status&&(e.ctx.fillStyle=t.color,e.ctx.beginPath(),e.ctx.arc(n.position[0]*e.tileSize+e.tileSize/2,n.position[1]*e.tileSize+e.tileSize/2,e.tileSize/2,0,2*Math.PI),e.ctx.closePath(),e.ctx.fill())}}function Game(t){var n;Object.defineProperty(this,"tileSize",{set:function(e){if(!+e)return console.error("Invalid value");n=Math.floor(+e),t.width=this.tileSize*gameProps.tiles[0],t.height=this.tileSize*gameProps.tiles[1]},get:function(){return n}}),Object.defineProperty(this,"ctx",{value:t.getContext("2d"),writable:!1}),this.playersInTheRoom=[],this.players=[],this.foods=[],this.status="toStart",this.engine=new Engine(this),this.interface=new Interface(this),this.socket=io(),this.socket.emit("connection"),this.socket.on("teste",function(e){console.log(e)}),gestureViewer(),this.engine.run(),this.socketEvents()}Game.prototype.newGame=function(){this.status="playing",this.for("players",function(e){e.newBody()})},Game.prototype.for=function(e,t){for(var n=this[e].length-1;0<=n;n--)t(this[e][n],n)},Game.prototype.addPlayers=function(){for(var e=this.playersInTheRoom.length-1;0<=e;e--){var t=this.playersInTheRoom[e],n=Object.assign(new Snake(this,t.id),t.playerProps);this.players.push(n)}},Game.prototype.addFoods=function(){var e=new Food(this);this.engine.add(e),this.foods.push(e),this.foods.length<gameProps.foods.qnt&&this.addFoods()},Game.prototype.resizeCanvas=function(){var t=this,e=function(){var n=[window.innerWidth,window.innerHeight],e=[0,0].map(function(e,t){return n[t]/gameProps.tiles[t]});t.tileSize=e[e[0]>e[1]?1:0]};e(),window.addEventListener("resize",e)},Game.prototype.login=function(e,t){var n=this;this.socket.emit("login",{playerNickname:e}),this.socket.on("logged",function(e){"function"==typeof t&&t(e),gameProps=Object.assign(gameProps,e.gameProps),n.playersInTheRoom=e.players,n.resizeCanvas()})},Game.prototype.socketEvents=function(){var t=this;this.socket.on("start",function(e){t.interface.closeModal(),t.addPlayers(),t.newGame()})};var gameProps={};function gameRules(n){n.engine.add(this);this.update=function(){"playing"==n.status&&(n.for("players",function(r,i){if(!r.killed){for(var o=r.head,e=r.body.length-1;0<=e;e--)if(0<e&&r.body[e].isEqual(o))return r.collided=!0;!r.collided&&n.for("players",function(e,t){if(i!=t&&!e.killed)for(var n=e.body.length-1;0<=n;n--)if(e.body[n].isEqual(o))return r.collided=!0})}}),n.for("players",function(e){return e.killed=e.collided}),n.for("foods",function(t){n.for("players",function(e){e.head.isEqual(t.position)&&(e.increase++,t.create())})}))}}function gestureViewer(){var e=document.querySelector("#gestureViewer"),r=document.createElement("canvas"),i=r.getContext("2d");e.appendChild(r);var a={},s=0,c=function(e,t,n,r){i.strokeStyle="#7da278",i.lineCap="round",i.lineWidth=8,i.beginPath(),i.moveTo(e,t),i.lineTo(n,r),i.stroke()};window.addEventListener("touchstart",function(e){for(var t=e.changedTouches.length-1;0<=t;t--){var n=e.changedTouches[t],r={x:n.pageX,y:n.pageY};a[n.identifier||++s]=r,c(r.x-1,r.y,r.x,r.y)}}),window.addEventListener("touchmove",function(e){for(var t=e.changedTouches.length-1;0<=t;t--){var n=e.changedTouches[t],r=a[n.identifier||s],i=n.pageX,o=n.pageY;c(r.x,r.y,i,o),r.x=i,r.y=o}}),window.addEventListener("touchend",function(e){for(var t=e.changedTouches.length-1;0<=t;t--){var n=e.changedTouches[t];delete a[n.identifier||s]}setTimeout(function(){return i.clearRect(0,0,r.width,r.height)},200)});var t=function(){r.width=window.innerWidth,r.height=window.innerHeight};t(),window.addEventListener("resize",t)}function Interface(t){var n=document.querySelector("#interface"),e=n.querySelector(".modal"),r=n.querySelector("#login form"),i=r.querySelector('[name="player_name"]'),o=n.querySelector("#main-menu"),a=o.querySelector("#single-player");this.closeModal=function(){e.classList.add("closed")};var s=o.querySelector("#welcome");r.addEventListener("submit",function(e){t.login(i.value,function(e){var t;console.log(e),t=i.value,s.innerHTML="Hi, "+t,n.className="main-menu"})}),a.addEventListener("click",function(e){t.socket.emit("single player")})}function _toConsumableArray(e){if(Array.isArray(e)){for(var t=0,n=Array(e.length);t<e.length;t++)n[t]=e[t];return n}return Array.from(e)}function Snake(t,e){var i=this;this.id=e,this.body=[],this.increase=0,this.collided=!1,this.killed=!1,this.bodyStart=[0,0];var o={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]},a=gameProps.snakes.initialDirection;Object.defineProperty(this,"direction",{get:function(){return a},set:function(e){var t=Object.keys(o),n=a,r=gameProps.snakes.reverse;t.includes(e)&&(a=e),u().isEqual(i.body[1])&&(r?(a=i.tailDirection,i.body.reverse()):a=n)}}),Object.defineProperties(this,{head:{get:function(){return i.body[0]}},tail:{get:function(){return i.body[i.body.length-1]}},tailDirection:{get:function(){var e=i.body[i.body.length-2],t=i.tail;return t[0]>e[0]?"right":t[0]<e[0]?"left":t[1]>e[1]?"down":t[1]<e[1]?"up":void 0}}}),t.engine.add(this);var s=new SnakeControls(this,t),c=0,u=function(){var e=o[i.direction],t=Math.abs(e[1]),n=[].concat(_toConsumableArray(i.body[0]));return n[t]+=e[t],n[t]>=gameProps.tiles[t]?n[t]=0:n[t]<0&&(n[t]=gameProps.tiles[t]-1),n};this.update=function(e){var t,n,r;i.body.length&&!i.killed&&(t=e,n=gameProps.snakes.speed,~~(r=t*n)<=~~c||(s.currentMovement(),c=r!=n?r:0,i.body.splice(0,0,u()),i.increase<1?i.body.pop():i.increase--))},this.draw=function(){i.killed||(t.ctx.fillStyle=gameProps.colors[i.id],i.body.forEach(function(e){t.ctx.fillRect(e[0]*t.tileSize,e[1]*t.tileSize,t.tileSize,t.tileSize)}))}}function _toConsumableArray(e){if(Array.isArray(e)){for(var t=0,n=Array(e.length);t<e.length;t++)n[t]=e[t];return n}return Array.from(e)}function SnakeControls(o,e){var t,a=[],n=document.querySelector("#touch-areas"),r={left:n.querySelector("#left"),right:n.querySelector("#right")},i=(t=gameProps.snakes.keyMaps[o.id])?{directions:Object.keys(t),keys:Object.keys(t).map(function(e){return t[e]}),direction:function(e){return this.directions[this.keys.indexOf(e)]}}:void 0;i&&window.addEventListener("keydown",function(e){return a.push(i.direction(e.key))});var s={},c={},u=gameProps.snakes.sensibilityTouch,l=[["left","right"],["up","down"]],d={0:"portrait-primary",180:"portrait-secondary",90:"landscape-primary","-90":"landscape-secondary"},h=function(){return screen.msOrientation||(screen.orientation||screen.mozOrientation||{}).type||d[window.orientation]},f=h();window.addEventListener("orientationchange",function(){return f=h()});var p=function(e){return[e.changedTouches[0].pageX,e.changedTouches[0].pageY]},y=function(t){r[t].addEventListener("touchstart",function(e){return s[t]=p(e)}),r[t].addEventListener("touchmove",function(e){c[t]=p(e),function(n){var e=[[],[]].map(function(e,t){return s[n][t]-c[n][t]});isLumia&&("landscape-primary"===f?e[0]=-e[0]:"landscape-secondary"===f&&(e[1]=-e[1]),-1<f.indexOf("landscape")&&e.reverse(),"portrait-secondary"===f&&(e[0]=-e[0],e[1]=-e[1]));var t=+(Math.abs(e[0])<Math.abs(e[1])),r=+(e[t]<0),i=l[t][r];Math.abs(e[t])>=u&&(i!=a.lastItem()&&i!=o.direction&&a.push(i),s[n]=[].concat(_toConsumableArray(c[n])))}(t)})};for(var g in r)y(g);document.ontouchmove=function(e){e.preventDefault()},this.currentMovement=function(){(a=a.filter(Boolean)).length&&(o.direction=a[0],a&&a.splice(0,1))}}function _toConsumableArray(e){if(Array.isArray(e)){for(var t=0,n=Array(e.length);t<e.length;t++)n[t]=e[t];return n}return Array.from(e)}window.isMobile=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),window.isLumia=/Lumia/i.test(navigator.userAgent),window.isElectron=/Electron/i.test(navigator.userAgent),Snake.prototype.newBody=function(){var e=this.bodyStart,t=[e[0],e[1]],n=e[2];this.body=[t];for(var r=gameProps.snakes.initialSize,i=1;i<r;i++){this.body.push([]);var o=[].concat(t);switch(n){case"right":case"left":o[0]="right"==n?t[0]+i:t[0]-i;break;case"up":case"down":o[1]="down"==n?t[1]+i:t[1]-i}for(var a=0;a<=1;a++)o[a]<0&&(o[a]=gameProps.tiles[a]-Math.abs(o[a])),o[a]>=gameProps.tiles[a]&&(o[a]=o[a]-gameProps.tiles[a]),this.body[i].push(o[a])}},Array.prototype.isEqual=function(e){return JSON.stringify(this)===JSON.stringify(e)},Array.prototype.sumWith=function(){for(var e=arguments.length,t=Array(e),n=0;n<e;n++)t[n]=arguments[n];t=[this].concat(_toConsumableArray(t)).sort(function(e,t){return t.length-e.length});for(var r=[].concat(_toConsumableArray(t[0])),i=1,o=t.length;i<o;i++)for(var a=t[i],s=0,c=a.length;s<c;s++){var u=a[s];r[s]+=u}return r},Array.prototype.lastItem=function(){return this[this.length-1]},"serviceWorker"in navigator&&!isElectron&&navigator.serviceWorker.register("serviceWorker.js").then(function(){return console.log("Service worker funcionando")}).catch(function(){return console.log("Erro ao instalar service worker")});
//# sourceMappingURL=snakeGame.js.map
