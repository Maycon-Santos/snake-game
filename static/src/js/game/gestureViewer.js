function gestureViewer(){

    var $gestureViewer = document.querySelector('#gestureViewer'),
        $canvas = document.createElement('canvas'),
        ctx = $canvas.getContext('2d');

    $gestureViewer.appendChild($canvas);

    var ballPoints = {};
    var counter = 0;

    const drawLine = (x0, y0, x1, y1) => {
        ctx.strokeStyle = "#7da278";
        ctx.lineCap = "round";
	    ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
    }

    window.addEventListener('touchstart', e => {
        for(let i = e.changedTouches.length - 1; i >= 0; i--){
            const touch = e.changedTouches[i];
            var ballPoint = {
                x: touch.pageX,
                y: touch.pageY
            }
            ballPoints[touch.identifier || ++counter] = ballPoint;
            drawLine(ballPoint.x - 1, ballPoint.y, ballPoint.x, ballPoint.y);
        }
    });

    window.addEventListener('touchmove', e => {
        for(let i = e.changedTouches.length - 1; i >= 0; i--){
            const touch = e.changedTouches[i];
            var ballPoint = ballPoints[touch.identifier || counter],
                x = touch.pageX, y = touch.pageY;

            drawLine(ballPoint.x, ballPoint.y, x, y);
            ballPoint.x = x;
            ballPoint.y = y;
        }
    });

    window.addEventListener('touchend', e => {
        for(let i = e.changedTouches.length - 1; i >= 0; i--){
            const touch = e.changedTouches[i];
            delete ballPoints[touch.identifier || counter];
        }
        setTimeout(() => ctx.clearRect(0, 0, $canvas.width, $canvas.height), 200);
    });

    const canvasFullSize = () => {
        $canvas.width = window.innerWidth;
        $canvas.height = window.innerHeight;
    }

    canvasFullSize();
    window.addEventListener('resize', canvasFullSize);
}