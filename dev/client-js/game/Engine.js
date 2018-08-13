function Engine(game){

    var $canvas = game.ctx.canvas;

    // Elements to render
    var objects = [];

    this.draw = () => {

        // Clear the canvas
        game.ctx.clearRect(0, 0, $canvas.width, $canvas.height);

        var i = objects.length;

        while(i--){
            // Draw/Render elements
            if(typeof objects[i]['draw'] == 'function') objects[i]['draw']();
        }

    }

    this.add = object => {

        objects.push(object);
                
        object.update = _object => {
            for (const key in _object) object[key] = _object[key];
            requestAnimationFrame(this.draw);
        }
        
    }

    this.clear = () => objects = [];

}