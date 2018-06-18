function snakeControls(snake, _keysMap){

    var keyMap = [Object.keys(_keysMap), Object.values(_keysMap)];

    window.addEventListener('keydown', function(e){

        var key = keyMap[1].indexOf(e.key);
        if(key > -1) snake.direction = keyMap[0][key];

    });

}