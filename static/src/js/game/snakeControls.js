function SnakeControls(snake, game){

    var rowMovements = [];

    var $touchAreas = document.querySelector('#touch-areas');
    var $touchArea = {left: $touchAreas.querySelector('#left'), right: $touchAreas.querySelector('#right')};

    // Keyboard
    var keyMap = (map => map ? {

        directions: Object.keys(map),
        keys: Object.keys(map).map(k => map[k]),

        direction: function(key){
            return this.directions[ this.keys.indexOf(key) ];
        }

    } : undefined)(gameProps.snakes.keyMaps[snake.id]);

    keyMap && window.addEventListener('keydown', e => rowMovements.push(keyMap.direction(e.key)));
    
    // Touch devices 
    let touchArea = 'all';
    let touchstart = {}, touchmove = {}, sensibilityTouch = gameProps.snakes.sensibilityTouch;
    const directions = [["left", "right"], ["up", "down"]];
    const orientationMap = {0: "portrait-primary", 180: "portrait-secondary", 90: "landscape-primary", "-90": "landscape-secondary"};

    const getOrientation = () => screen.msOrientation || (screen.orientation || screen.mozOrientation || {}).type || orientationMap[window.orientation];
    let orientation = getOrientation();
    window.addEventListener('orientationchange', () => orientation = getOrientation());

    const touchHandle = touchedArea => {

        let dragged = [[], []].map((_, axis) => touchstart[touchedArea][axis] - touchmove[touchedArea][axis]);

        if(isLumia){
            if(orientation === "landscape-primary") dragged[0] = -dragged[0];
            else if(orientation === "landscape-secondary") dragged[1] = -dragged[1];
            if(orientation.indexOf('landscape') > -1) dragged.reverse();

            if(orientation === "portrait-secondary"){
                dragged[0] = -dragged[0];
                dragged[1] = -dragged[1];
            }
        }

        if(touchedArea != touchArea && touchArea != 'all') return;

        let touchAxis = +(Math.abs(dragged[0]) < Math.abs(dragged[1])),
            moveIndex = +(dragged[touchAxis] < 0),
            direction = directions[touchAxis][moveIndex];

        if(Math.abs(dragged[touchAxis]) >= sensibilityTouch){
            if(direction != rowMovements.lastItem() && direction != snake.direction) rowMovements.push(direction);
            touchstart[touchedArea] = [...touchmove[touchedArea]];
        }

    }

    const touchPos = e => [e.changedTouches[0].pageX, e.changedTouches[0].pageY];

    if(touchArea){
        for (const area in $touchArea) {
            $touchArea[area].addEventListener('touchstart', e => touchstart[area] = touchPos(e));
            $touchArea[area].addEventListener('touchmove', e => { touchmove[area] = touchPos(e); touchHandle(area); });
        }
    }

    document.ontouchmove = function(e){ e.preventDefault(); } // Disable page scroll

    // Set current movement
    this.currentMovement = () => {

        rowMovements = rowMovements.filter(Boolean);

        if(!rowMovements.length) return;
        snake.direction = rowMovements[0];
        rowMovements && rowMovements.splice(0, 1);

    }

}