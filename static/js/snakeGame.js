"use strict";function Engine(e){var t=this,n=e.ctx.canvas,a=[],o=function(){e.ctx.clearRect(0,0,n.width,n.height),function(e){for(var t=arguments.length,n=Array(1<t?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];for(var i=a.length;i--;){var o;"function"==typeof a[i][e]&&(o=a[i])[e].apply(o,n)}}("draw")};this.run=function(){var r=t,i=performance.now();requestAnimationFrame(function e(t){var n=(t-i)/1e3;if(n=Math.min(1,n),o(),1<=n)return r.run();requestAnimationFrame(e)}.bind(t))},this.add=function(n){a.push(n),n.update=function(e){for(var t in e)n[t]=e[t]}}}function Food(e,t){var n=this;this.id=t,this.type,this.position=[],e.engine.add(this),e.socket.on("foodUpdate-"+t,this.update),this.draw=function(){"playing"==e.status&&n.type&&(e.ctx.fillStyle=n.type.color,e.ctx.beginPath(),e.ctx.arc(n.position[0]*e.tileSize+e.tileSize/2,n.position[1]*e.tileSize+e.tileSize/2,e.tileSize/2,0,2*Math.PI),e.ctx.closePath(),e.ctx.fill())}}function Game(t){var n;Object.defineProperty(this,"tileSize",{set:function(e){if(!+e)return console.error("Invalid value");n=Math.floor(+e),t.width=this.tileSize*gameProps.tiles[0],t.height=this.tileSize*gameProps.tiles[1]},get:function(){return n}}),Object.defineProperty(this,"ctx",{value:t.getContext("2d"),writable:!1});var r,i=t.parentNode;Object.defineProperty(this,"status",{set:function(e){return i.className=r=e},get:function(){return r}}),this.playersInTheRoom=[],this.id=null,this.players=[],this.foods=[],this.status="toStart",this.engine=new Engine(this),this.interface=new Interface(this),this.socket=io(),this.socket.on("teste",function(e){return console.log(e)}),gestureViewer(),this.engine.run(),this.socketEvents()}Game.prototype.newGame=function(){this.status="playing"},Game.prototype.addPlayers=function(){for(var e=this.playersInTheRoom.length-1;0<=e;e--){var t=this.playersInTheRoom[e],n=Object.assign(new Snake(this,t.id),t.playerProps);this.players.push(n)}},Game.prototype.addFoods=function(){var e=new Food(this,this.foods.length);this.foods.push(e),this.foods.length<gameProps.foods.qnt&&this.addFoods()},Game.prototype.resizeCanvas=function(){var t=this,r=document.querySelectorAll(".snake-chooser .snake"),e=function(){var n=[window.innerWidth,window.innerHeight],e=[0,0].map(function(e,t){return n[t]/gameProps.tiles[t]});t.tileSize=e[e[0]>e[1]?1:0],function(){for(var e=r.length-1;0<=e;e--)r[e].style.width=t.tileSize+"px",r[e].style.height=t.tileSize+"px"}()};e(),window.addEventListener("resize",e)},Game.prototype.login=function(e,t){var n=this;this.socket.emit("login",{playerNickname:e}),this.socket.on("logged",function(e){gameProps=Object.assign(gameProps,e.gameProps),n.id=e.myID,n.playersInTheRoom=e.players,n.resizeCanvas(),"function"==typeof t&&t(e)})},Game.prototype.socketEvents=function(){var n=this;this.socket.on("start",function(){n.interface.closeModal(),n.addPlayers(),n.addFoods(),n.newGame(),n.socket.emit("start")}),this.socket.on("newPlayer",function(e){return n.playersInTheRoom.push(e)}),this.socket.on("playersInTheRoomUpdate",function(e){var t=e.i;delete e.i,n.playersInTheRoom[t].playerProps=Object.assign(n.playersInTheRoom[t].playerProps,e)}),this.socket.on("delPlayer",function(e){delete n.playersInTheRoom[e],n.playersInTheRoom=n.playersInTheRoom.filter(Boolean)})};var gameProps={};function gestureViewer(){var e=document.querySelector("#gestureViewer"),r=document.createElement("canvas"),i=r.getContext("2d");e.appendChild(r);var a={},s=0,c=function(e,t,n,r){i.strokeStyle="#7da278",i.lineCap="round",i.lineWidth=8,i.beginPath(),i.moveTo(e,t),i.lineTo(n,r),i.stroke()};window.addEventListener("touchstart",function(e){for(var t=e.changedTouches.length-1;0<=t;t--){var n=e.changedTouches[t],r={x:n.pageX,y:n.pageY};a[n.identifier||++s]=r,c(r.x-1,r.y,r.x,r.y)}}),window.addEventListener("touchmove",function(e){for(var t=e.changedTouches.length-1;0<=t;t--){var n=e.changedTouches[t],r=a[n.identifier||s],i=n.pageX,o=n.pageY;c(r.x,r.y,i,o),r.x=i,r.y=o}}),window.addEventListener("touchend",function(e){for(var t=e.changedTouches.length-1;0<=t;t--){var n=e.changedTouches[t];delete a[n.identifier||s]}setTimeout(function(){return i.clearRect(0,0,r.width,r.height)},200)});var t=function(){r.width=window.innerWidth,r.height=window.innerHeight};t(),window.addEventListener("resize",t)}function Interface(t){var n=this,r=document.querySelector("#interface"),e=r.querySelector(".modal"),i=r.querySelector("#login form"),o=i.querySelector('[name="player_name"]'),a=r.querySelectorAll(".snake-chooser"),s=document.querySelector("#after-login .submit"),c=r.querySelector("#main-menu"),l=c.querySelector("#single-player"),u=c.querySelector("#multiplayer"),d=r.querySelector("#multiplayer-menu"),h=d.querySelector(".submit"),f=d.querySelector('[name="player_name"]'),p=d.querySelector(".input-number");this.closeModal=function(){return e.classList.add("closed")},this.open=function(e){return r.className=e};var y=c.querySelector("#welcome");i.addEventListener("submit",function(e){t.login(o.value,function(e){y.innerHTML="Hi, "+o.value,g(0),n.open("after-login")})}),l.addEventListener("click",function(e){t.socket.emit("single player")});for(var m=0,g=function(e){for(var t=a.length-1;0<=t;t--){var n=a[t],r=n.querySelector(".chooser-prev"),i=n.querySelector(".chooser-next"),o=n.querySelector(".snake");0==m&&r.classList.add("disabled"),m==gameProps.snakes.colors.length-1&&i.classList.add("disabled"),o.style.background=gameProps.snakes.colors[e]}},v=function(e){var t=a[e],n=t.querySelector(".chooser-prev"),r=t.querySelector(".chooser-next");n.addEventListener("click",function(e){-1==e.target.className.indexOf("disabled")&&(r.classList.remove("disabled"),g(--m))}),r.addEventListener("click",function(e){-1==e.target.className.indexOf("disabled")&&(n.classList.remove("disabled"),g(++m))})},k=a.length-1;0<=k;k--)v(k);s.addEventListener("click",function(){t.socket.emit("changeColor",m),n.open("main-menu")}),u.addEventListener("click",function(){n.open("multiplayer-menu")}),h.addEventListener("click",function(){t.socket.emit("multiplayer",{nickname:f.value,color:m,nPlayers:p.getAttribute("data-value")})})}function Snake(t,e){var n=this;this.id=e,this.idLocal=0,this.nickname=null,this.body=[],this.color=0,this.killed=!1,this.bodyStart=[0,0],t.engine.add(this),t.id==this.id&&new SnakeControls(this,t),t.socket.on("snakeUpdate-"+e,this.update),this.draw=function(){n.killed||(t.ctx.fillStyle=gameProps.snakes.colors[n.color],n.body.forEach(function(e){t.ctx.fillRect(e[0]*t.tileSize,e[1]*t.tileSize,t.tileSize,t.tileSize)}))}}function _toConsumableArray(e){if(Array.isArray(e)){for(var t=0,n=Array(e.length);t<e.length;t++)n[t]=e[t];return n}return Array.from(e)}function SnakeControls(o,t){var n,a=function(e){e&&t.socket.emit("moveTo",e)},e=document.querySelector("#touch-areas"),r={left:e.querySelector("#left"),right:e.querySelector("#right")},i=(n=gameProps.snakes.keyMaps[o.idLocal])?{directions:Object.keys(n),keys:Object.keys(n).map(function(e){return n[e]}),direction:function(e){return this.directions[this.keys.indexOf(e)]}}:void 0;i&&window.addEventListener("keydown",function(e){return a(i.direction(e.key))});var s={},c={},l=gameProps.snakes.sensibilityTouch,u=[["left","right"],["up","down"]],d={0:"portrait-primary",180:"portrait-secondary",90:"landscape-primary","-90":"landscape-secondary"},h=function(){return screen.msOrientation||(screen.orientation||screen.mozOrientation||{}).type||d[window.orientation]},f=h();window.addEventListener("orientationchange",function(){return f=h()});var p=function(e){return[e.changedTouches[0].pageX,e.changedTouches[0].pageY]},y=function(t){r[t].addEventListener("touchstart",function(e){return s[t]=p(e)}),r[t].addEventListener("touchmove",function(e){c[t]=p(e),function(n){var e=[[],[]].map(function(e,t){return s[n][t]-c[n][t]});isLumia&&("landscape-primary"===f?e[0]=-e[0]:"landscape-secondary"===f&&(e[1]=-e[1]),-1<f.indexOf("landscape")&&e.reverse(),"portrait-secondary"===f&&(e[0]=-e[0],e[1]=-e[1]));var t=+(Math.abs(e[0])<Math.abs(e[1])),r=+(e[t]<0),i=u[t][r];Math.abs(e[t])>=l&&(i!=rowMovements.lastItem()&&i!=o.direction&&a(i),s[n]=[].concat(_toConsumableArray(c[n])))}(t)})};for(var m in r)y(m);document.ontouchmove=function(e){e.preventDefault()}}function _toConsumableArray(e){if(Array.isArray(e)){for(var t=0,n=Array(e.length);t<e.length;t++)n[t]=e[t];return n}return Array.from(e)}window.isMobile=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),window.isLumia=/Lumia/i.test(navigator.userAgent),window.isElectron=/Electron/i.test(navigator.userAgent),Array.prototype.isEqual=function(e){return JSON.stringify(this)===JSON.stringify(e)},Array.prototype.sumWith=function(){for(var e=arguments.length,t=Array(e),n=0;n<e;n++)t[n]=arguments[n];t=[this].concat(_toConsumableArray(t)).sort(function(e,t){return t.length-e.length});for(var r=[].concat(_toConsumableArray(t[0])),i=1,o=t.length;i<o;i++)for(var a=t[i],s=0,c=a.length;s<c;s++){var l=a[s];r[s]+=l}return r},Array.prototype.lastItem=function(){return this[this.length-1]};for(var $inputsNumber=document.querySelectorAll(".input-number"),_loop=function(e){var t=$inputsNumber[e],n=t.querySelector("span"),r=t.querySelector(".decrement"),i=t.querySelector(".increment");r.addEventListener("click",function(){var e=+t.getAttribute("data-value");(t.getAttribute("data-min")||-1/0)<e&&(e--,n.innerHTML=0==e?"o":e,t.setAttribute("data-value",e))}),i.addEventListener("click",function(){var e=+t.getAttribute("data-value");e<(t.getAttribute("data-max")||1/0)&&(e++,n.innerHTML=0==e?"o":e,t.setAttribute("data-value",e))})},i=$inputsNumber.length-1;0<=i;i--)_loop(i);"serviceWorker"in navigator&&!isElectron&&navigator.serviceWorker.register("serviceWorker.js").then(function(){return console.log("Service worker funcionando")}).catch(function(){return console.log("Erro ao instalar service worker")});
//# sourceMappingURL=snakeGame.js.map