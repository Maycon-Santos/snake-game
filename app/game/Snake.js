function Snake(game, props){

    this.id = null;
    this.enhancerId = null;
    this.body = [];

    this.increase = 0;
    this.collided = false;

    this.bodyStart = [0, 0];

    this.AI = false;

    this.merge(props);

    this.directionMap = {
        'left': [-1, 0],
        'right': [1, 0],
        'up': [0, -1],
        'down': [0, 1],

        '-1': 'left',
        1: 'right',
        '-2': 'up',
        2: 'down'
    }

    var direction = gameProps.snakes.initialDirection;
    Object.defineProperty(this, 'direction', {
        get: () => direction,
        set: (to) => {

            let directions = Object.keys(this.directionMap),
                oldDirection = direction,
                reverse = gameProps.snakes.reverse;

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

    var killed = false;
    Object.defineProperty(this, 'killed', {
        get: () => killed,
        set: (Bool) => {
            if(Bool != killed){
                killed = !!Bool;
                this.senUpdate({killed: killed});
            }
        }
    });

    Object.defineProperty(this, 'bodyVertices', {
        get: () => {

            var body = [[this.body[0]]],
                prevPos = this.body[0],
                axisEqual;

            for(let i = 1, L = this.body.length; i < L; i++){
                const bodyFragment = this.body[i];

                bodyFragment.map((pos, axis) => {

                    if(pos == prevPos[axis]){
                        if(!axisEqual) axisEqual = axis;
                        else if(axisEqual != axis) {
                            body.push([]);
                            axisEqual = axis;
                        }
                    }

                });

                body.lastItem().push(bodyFragment);

                prevPos = bodyFragment;

            }

            return body;

        }
    });

    Object.defineProperty(this, 'verticesDirections', {
        get: () => {

            let head = this.head,
                body = this.bodyVertices,
                directions = [];

            for(let i = 1, L = body.length; i < L; i++){
                const fragment = body[i];

                loopFragment: for(let j = 0, L2 = fragment.length; j < L2; j++){
                    const pos = fragment[j];

                    for(let axis = 0, L3 = pos.length; axis < L3; axis++){

                        if(head[axis] == pos[axis]){
    
                            let otherAxis = Math.abs(axis - 1);
    
                            if(head[otherAxis] < pos[otherAxis])
                                directions.push(this.directionMap[1 * (otherAxis + 1)]);
                            else
                                directions.push(this.directionMap[-1 * (otherAxis + 1)]);
    
                            break loopFragment;
    
                        }

                    }
                    
                }

            }

            return directions;

        }
    });

    this.senUpdate = update =>
        game.engine.sendUpdate('players', this.enhancerId, update);

    game.engine.add(this);
    const snakeControls = new SnakeControls(this, game);

    this.newBody();

    if(this.AI) this.AI = new snakeAI(game, this);

    var progressMove = 0;
    const movement = (deltaTime) => {

        let speed = gameProps.snakes.speed;
        let progress = deltaTime * speed;
    
        if(~~progress <= ~~progressMove) return;

        if(this.AI) this.AI.movement();
        else snakeControls.currentMovement();

        progressMove = progress != speed ? progress : 0;
        
        this.body.splice(0, 0, nextPos());
        this.increase < 1 ? this.body.pop() : this.increase--;

        this.senUpdate({body: this.body});
        
    }

    const nextPos = (steps = 1) => {

        let direction = this.directionMap[this.direction],
            axis = Math.abs(direction[1]),
            nextPos = [...this.body[0]];

        nextPos[axis] += direction[axis] * steps;

        if(nextPos[axis] >= gameProps.tiles[axis]) nextPos[axis] = 0;
        else if(nextPos[axis] < 0) nextPos[axis] = gameProps.tiles[axis] - 1;

        return nextPos;

    }

    this.predictMovement = (direction, steps = 1) => {

        var directionNow = this.direction;

        this.direction = direction;

        var _nextPos = nextPos(steps);

        this.direction = directionNow;

        return _nextPos;

    }

    this.update = (deltaTime) => {
        if(this.body.length && !this.killed){
            movement(deltaTime);
        }
    }

}

Snake.prototype.newBody = function(){

    var bodyStart = this.bodyStart,
        from = [bodyStart[0], bodyStart[1]],
        to = bodyStart[2];

    this.body = [from];

    var initialSize = gameProps.snakes.initialSize;
    for (let i = 1; i < initialSize; i++) {

        this.body.push([]);

        let newPos = [...from];

        switch(to){

            case 'right':
            case 'left':
                newPos[0] = to == 'right' ? from[0]+i : from[0]-i;
                break;

            case 'up':
            case 'down':
                newPos[1] = to == 'down' ? from[1]+i : from[1]-i;
                break;

        }

        for (let axis = 0; axis <= 1; axis++) {

            if(newPos[axis] < 0) newPos[axis] = gameProps.tiles[axis] - Math.abs(newPos[axis]);
            if(newPos[axis] >= gameProps.tiles[axis]) newPos[axis] = newPos[axis] - gameProps.tiles[axis];
            
            this.body[i].push(newPos[axis]);
            
        }

    }

    this.senUpdate({body: this.body});

}