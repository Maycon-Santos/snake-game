function Engine(){

    var objects = [];

    const runFunction = (fn, ...args) => {

        //io.emit('teste', objects);

        var i = objects.length;

        while(i--){
            if(typeof objects[i][fn] == 'function') objects[i][fn](...args);
        }

    }

    // const update = (deltaTime) => {
    //     io.emit('teste', deltaTime);
    // }

    const update = (deltaTime) => runFunction('update', deltaTime);

    const draw = () => {

    }

    this.run = () => {

        let lastUpdate = Date.now();
        
        const run = () => {

            let now = Date.now();
            let deltaTime = (now - lastUpdate) / 1000;
            deltaTime = Math.min(1, deltaTime);

            if(deltaTime >= 1)
                lastUpdate = now;

            update(deltaTime);
            draw();

        };

        setInterval(run, 0);

    }

    this.add = (object) => objects.push(object);

    this.clear = () => objects = [];

}