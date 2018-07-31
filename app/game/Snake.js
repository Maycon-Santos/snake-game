function Snake(game, props){

    // Socket id of the player
    this.id = null;

    this.enhancerId = null;

    this.body = [];

    // Powerups
    this.increase = 0; // Number the snake will grow
    this.superSpeed = 0;
    this.superSlow = 0;
    this.freeze = 0;

    this.collided = false;

    this.bodyStart = [0, 0];

    // If the snake is going to have A.I
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
        set: to => {

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

                if(killed) game.gameRules.take.deathCounter++;

                if(game.gameRules.take.deathCounter >= game.players.length - 1)
                    game.status = 'over';
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

    // Function responsible for sending the processed data to the client
    this.senUpdate = update =>
        game.engine.sendUpdate('players', this.enhancerId, update);

    game.engine.add(this);

    // Get movements by controlls of the client
    const snakeControls = new SnakeControls(this, game);

    // Create a new body
    this.newBody();

    // Insert snake A.I
    if(this.AI) this.AI = new snakeAI(game, this);

    var progressed = 0;
    const movement = (deltaTime) => {

        let speed = gameProps.snakes.speed;

        if(this.superSpeed > 0) speed *= 1.4;
        if(this.superSlow > 0) speed *= 0.5;

        let progress = deltaTime * speed;

        if(progressed > progress) progressed = 0;

        if(~~progress <= ~~progressed) return;

        if(this.AI) this.AI.movement();
        else snakeControls.currentMovement();

        progressed = progress >= speed ? 0 : progress;
        
        if(this.freeze <= 0){
            this.body.splice(0, 0, nextPos());
            this.increase < 1 ? this.body.pop() : this.increase--;
        }

        if(this.superSpeed) this.superSpeed--;
        if(this.superSlow) this.superSlow--;
        if(this.freeze) this.freeze--;

        this.senUpdate({body: this.body});
        
    }

    // Get the next player position
    const nextPos = (steps = 1) => {

        let direction = this.directionMap[this.direction],
            axis = Math.abs(direction[1]),
            nextPos = [...this.body[0]];

        nextPos[axis] += direction[axis] * steps;

        if(nextPos[axis] >= gameProps.tiles[axis]) nextPos[axis] = 0;
        else if(nextPos[axis] < 0) nextPos[axis] = gameProps.tiles[axis] - 1;

        return nextPos;

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