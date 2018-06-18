function SnakeControls(snake, _keysMap, _touchMap){

    var keyMap = _keysMap ? [Object.keys(_keysMap), Object.values(_keysMap)] : _keysMap,
        touchMap = _touchMap ? [Object.keys(_touchMap), Object.values(_touchMap)] : _touchMap,
        orientation = null,
        rowMovements = [];

    const getOrientation = () => {
        switch (window.orientation) {  
            case 0:
                orientation = 'portrait';
                break; 

            case 180:
                orientation = 'portrait-upsideDown';
                break; 

            case -90:
                orientation = 'landscape-clockwise';
                break;  

            case 90:
                orientation = 'landscape';
                break;
        }
    }


    window.addEventListener('orientationchange', getOrientation);
    getOrientation();

    window.addEventListener('keydown', function(e){

        var key = keyMap[1].indexOf(e.key);
        if(key > -1) rowMovements.push(keyMap[0][key]);

    });

    var touchstart = [], touchmovedMax = [], touchend = [];
    touchMap && window.addEventListener('touchstart', e => touchstart = [e.changedTouches[0].screenX, e.changedTouches[0].screenY]);

    var moved = [0, 0], lastMoved = [0, 0];
    touchMap && window.addEventListener('touchmove', e => {

        var touch, screen = [e.changedTouches[0].screenX, e.changedTouches[0].screenY];

        if(screen[0] > lastMoved[0]) moved[0]++;

        if(screen[1] > lastMoved[1]) moved[1]++;

        if(screen[0] < lastMoved[0]) moved[0]--;

        if(screen[1] < lastMoved[1]) moved[1]--;

        if(orientation == 'landscape'){
            moved[0] = -moved[0];
            dragged.reverse();

        }else if(orientation == 'landscape-clockwise'){
            moved[1] = -moved[1];
            dragged.reverse();

        }else if(orientation == 'portrait-upsideDown'){
            moved[0] = -moved[0];
            moved[1] = -moved[1];
        }

        if(moved[0] <= -10){
            touch = touchMap[1].indexOf('swipeLeft');
            moved = [0, 0];
        }

        if(moved[0] >= 10){
            touch = touchMap[1].indexOf('swipeRight');
            moved = [0, 0];
        }

        if(moved[1] <= -10){
            touch = touchMap[1].indexOf('swipeUp');
            moved = [0, 0];
        }

        if(moved[1] >= 10){
            touch = touchMap[1].indexOf('swipeDown');
            moved = [0, 0];
        }

        keyMap[0][touch] && rowMovements[0] != keyMap[0][touch] && rowMovements.push(keyMap[0][touch]);

        lastMoved = screen;

    });

    touchMap && window.addEventListener('touchend', e => {

        moved = lastMoved = [0, 0];
        
    });

    this.currentMovement = () => {

        if(!rowMovements[0]) return;
        snake.direction = rowMovements[0];
        rowMovements.splice(0, 1);

    }

}