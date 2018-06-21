"use strict";function Engine(o){var e=this,a=o.ctx.canvas,s=[],c=function(e){for(var t=arguments.length,r=Array(1<t?t-1:0),n=1;n<t;n++)r[n-1]=arguments[n];for(var i=s.length;i--;){var o;"function"==typeof s[i][e]&&(o=s[i])[e].apply(o,r)}};this.run=function(){var n=e,i=performance.now();requestAnimationFrame(function e(t){var r=(t-i)/1e3;if(r=Math.min(1,r),c("update",r),o.ctx.clearRect(0,0,a.width,a.height),c("draw"),1<=r)return n.run();requestAnimationFrame(e)}.bind(e))},this.add=function(e){return s.push(e)}}function Food(e){var t,r=this,n=[];for(var i in this.position=[],gameProps.foods.types)for(var o=gameProps.foods.types[i],a=o.chance,s=0;s<a;s++)n.push(o);this.create=function(){var e=Math.round(Math.random()*(n.length-1));t=n[e],this.position=[[],[]].map(function(e,t){return Math.round(Math.random()*(gameProps.tiles[t]-1))})},this.update=function(){},this.draw=function(){e.ctx.fillStyle=t.color,e.ctx.beginPath(),e.ctx.arc(r.position[0]*e.tileSize+e.tileSize/2,r.position[1]*e.tileSize+e.tileSize/2,e.tileSize/2,0,2*Math.PI),e.ctx.closePath(),e.ctx.fill()}}function Game(t){var r;Object.defineProperty(this,"tileSize",{set:function(e){if(!+e)return console.error("Invalid value");r=Math.floor(+e),t.width=this.tileSize*gameProps.tiles[0],t.height=this.tileSize*gameProps.tiles[1]},get:function(){return r}}),Object.defineProperty(this,"ctx",{value:t.getContext("2d"),writable:!1}),this.players=[],this.foods=[],this.engine=new Engine(this),this.engine.add(this),new gameRules(this),this.addPlayers(),this.addFoods(),this.newGame(),gestureViewer(),this.resizeCanvas(),this.engine.run()}Game.prototype.newGame=function(){this.for("foods",function(e){e.create()}),this.for("players",function(e){e.newBody()})},Game.prototype.for=function(e,t){for(var r=this[e].length-1;0<=r;r--)t(this[e][r],r)},Game.prototype.addPlayers=function(){var e=new Snake(this,this.players.length);this.players.push(e),this.players.length<gameProps.snakes.players.length&&this.addPlayers()},Game.prototype.addFoods=function(){var e=new Food(this);this.engine.add(e),this.foods.push(e),this.foods.length<gameProps.foods.qnt&&this.addFoods()};var gameProps={tiles:[64,36],snakes:{speed:15,initialSize:1,bodyStart:[7,4,"left"],initialDirection:"right",reverse:!(Game.prototype.resizeCanvas=function(){var t=this,e=function(){var r=[window.innerWidth,window.innerHeight],e=[0,0].map(function(e,t){return r[t]/gameProps.tiles[t]});t.tileSize=e[e[0]>e[1]?1:0]};e(),window.addEventListener("resize",e)}),sensibilityTouch:30,players:[{color:"#000000",bodyStart:[60,30,"up"],initialDirection:"right",keyMap:{left:"ArrowLeft",right:"ArrowRight",up:"ArrowUp",down:"ArrowDown"},touchArea:"right"},{color:"#ff0000",bodyStart:[6,6,"left"],keyMap:{left:"a",right:"d",up:"w",down:"s"},touchArea:"left"}]},foods:{qnt:1,types:{normal:{chance:5,color:"#FFE400"},freezer:{chance:0,color:"#008F30"},superSpeed:{chance:0,color:"#008F30"}}}};function gameRules(r){r.engine.add(this);this.update=function(){r.for("players",function(n,i){if(!n.killed){for(var o=n.head,e=n.body.length-1;0<=e;e--)if(0<e&&n.body[e].isEqual(o))return n.collided=!0;!n.collided&&r.for("players",function(e,t){if(i!=t&&!e.killed)for(var r=e.body.length-1;0<=r;r--)if(e.body[r].isEqual(o))return n.collided=!0})}}),r.for("players",function(e){return e.killed=e.collided}),r.for("foods",function(t){r.for("players",function(e){e.head.isEqual(t.position)&&(e.increase++,t.create())})})}}function gestureViewer(){var e=document.querySelector("#gestureViewer"),n=document.createElement("canvas"),i=n.getContext("2d");e.appendChild(n);var a={},s=0,c=function(e,t,r,n){i.strokeStyle="#7da278",i.lineCap="round",i.lineWidth=8,i.beginPath(),i.moveTo(e,t),i.lineTo(r,n),i.stroke()};window.addEventListener("touchstart",function(e){for(var t=e.changedTouches.length-1;0<=t;t--){var r=e.changedTouches[t],n={x:r.pageX,y:r.pageY};a[r.identifier||++s]=n,c(n.x-1,n.y,n.x,n.y)}}),window.addEventListener("touchmove",function(e){for(var t=e.changedTouches.length-1;0<=t;t--){var r=e.changedTouches[t],n=a[r.identifier||s],i=r.pageX,o=r.pageY;c(n.x,n.y,i,o),n.x=i,n.y=o}}),window.addEventListener("touchend",function(e){for(var t=e.changedTouches.length-1;0<=t;t--){var r=e.changedTouches[t];delete a[r.identifier||s]}setTimeout(function(){return i.clearRect(0,0,n.width,n.height)},200)});var t=function(){n.width=window.innerWidth,n.height=window.innerHeight};t(),window.addEventListener("resize",t)}function _toConsumableArray(e){if(Array.isArray(e)){for(var t=0,r=Array(e.length);t<e.length;t++)r[t]=e[t];return r}return Array.from(e)}function Snake(t,e){var i=this;this.id=e,this.body=[],this.increase=0,this.collided=!1,this.killed=!1,this.playerProps=gameProps.snakes.players[e];var o={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]},a=this.playerProps.initialDirection||gameProps.snakes.initialDirection;Object.defineProperty(this,"direction",{get:function(){return a},set:function(e){var t=Object.keys(o),r=a,n=i.playerProps.reverse||gameProps.snakes.reverse;t.includes(e)&&(a=e),l().isEqual(i.body[1])&&(n?(a=i.tailDirection,i.body.reverse()):a=r)}}),Object.defineProperties(this,{head:{get:function(){return i.body[0]}},tail:{get:function(){return i.body[i.body.length-1]}},tailDirection:{get:function(){var e=i.body[i.body.length-2],t=i.tail;return t[0]>e[0]?"right":t[0]<e[0]?"left":t[1]>e[1]?"down":t[1]<e[1]?"up":void 0}}}),t.engine.add(this);var s=new SnakeControls(this,t),c=0,l=function(){var e=o[i.direction],t=Math.abs(e[1]),r=[].concat(_toConsumableArray(i.body[0]));return r[t]+=e[t],r[t]>=gameProps.tiles[t]?r[t]=0:r[t]<0&&(r[t]=gameProps.tiles[t]-1),r};this.update=function(e){var t,r,n;i.body.length&&!i.killed&&(t=e,r=i.playerProps.speed||gameProps.snakes.speed,~~(n=t*r)<=~~c||(s.currentMovement(),c=n!=r?n:0,i.body.splice(0,0,l()),i.increase<1?i.body.pop():i.increase--))},this.draw=function(){i.killed||(t.ctx.fillStyle=i.playerProps.color,i.body.forEach(function(e){t.ctx.fillRect(e[0]*t.tileSize,e[1]*t.tileSize,t.tileSize,t.tileSize)}))}}function _toConsumableArray(e){if(Array.isArray(e)){for(var t=0,r=Array(e.length);t<e.length;t++)r[t]=e[t];return r}return Array.from(e)}function SnakeControls(o,e){var t,a=[],r=document.querySelector("#touch-areas"),n={left:r.querySelector("#left"),right:r.querySelector("#right")},i=(t=o.playerProps.keyMap,i={directions:Object.keys(t),keys:Object.keys(t).map(function(e){return t[e]}),direction:function(e){return this.directions[this.keys.indexOf(e)]}});window.addEventListener("keydown",function(e){return a.push(i.direction(e.key))});var s=o.playerProps.touchArea,c={},l={},d=gameProps.snakes.sensibilityTouch,u=[["left","right"],["up","down"]],h={0:"portrait-primary",180:"portrait-secondary",90:"landscape-primary","-90":"landscape-secondary"},f=function(){return screen.msOrientation||(screen.orientation||screen.mozOrientation||{}).type||h[window.orientation]},p=f();window.addEventListener("orientationchange",function(){return p=f()});var y=function(e){return[e.changedTouches[0].pageX,e.changedTouches[0].pageY]};if(s){var g=function(t){n[t].addEventListener("touchstart",function(e){return c[t]=y(e)}),n[t].addEventListener("touchmove",function(e){l[t]=y(e),function(r){var e=[[],[]].map(function(e,t){return c[r][t]-l[r][t]});if(isLumia&&("landscape-primary"===p?e[0]=-e[0]:"landscape-secondary"===p&&(e[1]=-e[1]),-1<p.indexOf("landscape")&&e.reverse(),"portrait-secondary"===p&&(e[0]=-e[0],e[1]=-e[1])),r==s||"all"==s){var t=+(Math.abs(e[0])<Math.abs(e[1])),n=+(e[t]<0),i=u[t][n];Math.abs(e[t])>=d&&(i!=a.lastItem()&&i!=o.direction&&a.push(i),c[r]=[].concat(_toConsumableArray(l[r])))}}(t)})};for(var v in n)g(v)}document.ontouchmove=function(e){e.preventDefault()},this.currentMovement=function(){(a=a.filter(Boolean)).length&&(o.direction=a[0],a&&a.splice(0,1))}}function _toConsumableArray(e){if(Array.isArray(e)){for(var t=0,r=Array(e.length);t<e.length;t++)r[t]=e[t];return r}return Array.from(e)}window.isMobile=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),window.isLumia=/Lumia/i.test(navigator.userAgent),window.isElectron=/Electron/i.test(navigator.userAgent),Snake.prototype.newBody=function(){var e=this.playerProps.bodyStart||gameProps.snakes.bodyStart,t=[e[0],e[1]],r=e[2];this.body=[t];for(var n=this.playerProps.initialSize||gameProps.snakes.initialSize,i=1;i<n;i++){this.body.push([]);var o=[].concat(t);switch(r){case"right":case"left":o[0]="right"==r?t[0]+i:t[0]-i;break;case"up":case"down":o[1]="down"==r?t[1]+i:t[1]-i}for(var a=0;a<=1;a++)o[a]<0&&(o[a]=gameProps.tiles[a]-Math.abs(o[a])),o[a]>=gameProps.tiles[a]&&(o[a]=o[a]-gameProps.tiles[a]),this.body[i].push(o[a])}},Array.prototype.isEqual=function(e){return JSON.stringify(this)===JSON.stringify(e)},Array.prototype.sumWith=function(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];t=[this].concat(_toConsumableArray(t)).sort(function(e,t){return t.length-e.length});for(var n=[].concat(_toConsumableArray(t[0])),i=1,o=t.length;i<o;i++)for(var a=t[i],s=0,c=a.length;s<c;s++){var l=a[s];n[s]+=l}return n},Array.prototype.lastItem=function(){return this[this.length-1]},"serviceWorker"in navigator&&!isElectron&&navigator.serviceWorker.register("serviceWorker.js").then(function(){return console.log("Service worker funcionando")}).catch(function(){return console.log("Erro ao instalar service worker")});
//# sourceMappingURL=snakeGame.js.map
