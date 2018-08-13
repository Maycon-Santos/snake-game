function Engine(){

    // Elements to process
    var objects = [],
    // Elements processed
        updates = {};

    const update = (deltaTime) => {

        var i = objects.length;

        while(i--){
            if(typeof objects[i]['update'] == 'function') objects[i]['update'](deltaTime);
        }

    }

    const sendUpdate = () => {
        if(Object.keys(updates).length){
            io.emit('update', updates);
            updates = {};
        }
    }

    this.run = () => {

        let lastUpdate = Date.now();
        
        const run = () => {

            let now = Date.now();
            let deltaTime = (now - lastUpdate) / 1000;
            deltaTime = Math.min(1, deltaTime);

            if(deltaTime >= 1) lastUpdate = now;

            update(deltaTime);
            sendUpdate();

        };

        setInterval(run, 0);

    }

    this.add = (object) => objects.push(object);

    this.sendUpdate = (object, i, update) => {

        if(!updates[object]) updates[object] = [];
        if(!updates[object][i]) updates[object][i] = {};
        
        updates[object][i] = Object.assign(updates[object][i], update);

    }

    this.clear = () => objects = [];

}