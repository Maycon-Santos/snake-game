function gestureViewer(){

    var $gestureViewer = document.querySelector('#gestureViewer'),
        $canvas = document.createElement('canvas'),
        ctx = $canvas.getContext('2d');

    $gestureViewer.appendChild($canvas);

    window.addEventListener('touchstart', e => {
        ctx.beginPath();
        ctx.moveTo(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    });

    window.addEventListener('touchmove', e => {
        ctx.lineTo(e.changedTouches[0].pageX, e.changedTouches[0].pageY);

        ctx.strokeStyle = "#7da278";
        ctx.lineWidth = 8;

        ctx.stroke();
    });

    window.addEventListener('touchend', () => {
        ctx.closePath();
        setTimeout(() => ctx.clearRect(0, 0, $canvas.width, $canvas.height), 200);
    });

    const canvasFullSize = () => {
        $canvas.width = window.innerWidth;
        $canvas.height = window.innerHeight;
    }

    canvasFullSize();
    window.addEventListener('resize', canvasFullSize);
}