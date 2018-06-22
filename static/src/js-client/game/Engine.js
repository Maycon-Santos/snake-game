function Engine(game){

    var canvas = game.ctx.canvas;

    var objects = [];

    const runFunction = (fn, ...args) => {

        var i = objects.length;

        while(i--){
            if(typeof objects[i][fn] == 'function') objects[i][fn](...args);
        }

    }

    const update = (deltaTime) => runFunction('update', deltaTime);

    const draw = () => {
        game.ctx.clearRect(0, 0, canvas.width, canvas.height);
        runFunction('draw');
    }


    this.run = () => {

        let engine = this,
            start = performance.now();

        requestAnimationFrame(function run(timestamp){

            let deltaTime = (timestamp - start) / 1000;
            deltaTime = Math.min(1, deltaTime);

            update(deltaTime);
            draw();

            if(deltaTime >= 1) return engine.run();
            requestAnimationFrame(run);

        }.bind(this));

    }

    this.add = (object) => objects.push(object);

}