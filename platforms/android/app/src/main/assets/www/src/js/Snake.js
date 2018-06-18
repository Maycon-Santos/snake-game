function Snake(game, id){

    this.id = id;
    this.body = [];

    this.increase = 0;
    this.collided = false;
    this.killed = false;

    this.playerProps = gameProps.snakes.players[id];

    var directionMap = {
        'left': [-1, 0],
        'right': [1, 0],
        'up': [0, -1],
        'down': [0, 1]
    }

    var direction = this.playerProps.initialDirection || gameProps.snakes.initialDirection;
    Object.defineProperty(this, 'direction', {
        get: () => direction,
        set: (to) => {

            let directions = Object.keys(directionMap), // X, Y
                oldDirection = direction,
                reverse = this.playerProps.reverse || gameProps.snakes.reverse;

            if(directions.includes(to)) direction = to;

            if(nextPos().isEqual(this.body[1])){

                if(!reverse) direction = oldDirection;
                else{
                    direction = this.tailDirection;
                    this.body.reverse();
                }

            }

        }
    });

    Object.defineProperties(this, {
        head: { get: () => this.body[0] },
        tail: { get: () => this.body[this.body.length - 1]},
        tailDirection: {
            get: () => {
                let penultBodyFragment = this.body[this.body.length - 2],
                    tail = this.tail;

                if(tail[0] > penultBodyFragment[0]) return 'right';
                if(tail[0] < penultBodyFragment[0]) return 'left';

                if(tail[1] > penultBodyFragment[1]) return 'down';
                if(tail[1] < penultBodyFragment[1]) return 'up';

            }
        }
    });

    game.engine.add(this);
    snakeControls(this, this.playerProps.keyMap);

    var progressMove = 0;
    const movement = (deltaTime) => {

        let speed = this.playerProps.speed || gameProps.snakes.speed;
        let progress = deltaTime * speed;
    
        if(~~progress <= ~~progressMove) return;

        progressMove = progress != speed ? progress : 0;
        
        this.increase < 1 ? this.body.pop() : this.increase--;
        this.body.splice(0, 0, nextPos());

    }

    const nextPos = () => {

        let direction = directionMap[this.direction],
            axis = Math.abs(direction[1]),
            nextPos = [...this.body[0]];

        nextPos[axis] += direction[axis];

        if(nextPos[axis] >= gameProps.tiles[axis]) nextPos[axis] = 0;
        else if(nextPos[axis] < 0) nextPos[axis] = gameProps.tiles[axis] - 1;

        return nextPos;

    }

    this.update = (deltaTime) => {
        if(this.body.length && !this.killed){
            movement(deltaTime);
        }
    }

    this.draw = () => {

        if(this.killed) return;

        game.ctx.fillStyle = this.playerProps.color;

        this.body.forEach(bodyFragment => {
            game.ctx.fillRect(
                bodyFragment[0] * game.tileSize,
                bodyFragment[1] * game.tileSize,
                game.tileSize,
                game.tileSize
            );
        });

    }

}

Snake.prototype.newBody = function(){

    var bodyStart = this.playerProps.bodyStart || gameProps.snakes.bodyStart,
        from = [bodyStart[0], bodyStart[1]],
        to = bodyStart[2];

    this.body = [from];

    var initialSize = this.playerProps.initialSize || gameProps.snakes.initialSize;
    for (let i = 1; i < initialSize; i++) {

        this.body.push([]);

        let xPos = from[0], yPos = from[1];

        switch(to){

            case 'right':
            case 'left':
                xPos = to == 'right' ? from[0]+i : from[0]-i;
                break;

            case 'up':
            case 'down':
                yPos = to == 'down' ? from[1]+i : from[1]-i;
                break;

        }

        this.body[i].push(xPos); // X
        this.body[i].push(yPos); // Y

    }

}