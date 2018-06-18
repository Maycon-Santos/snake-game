var gameProps = {
    tiles: [64, 36], // X, Y

    snakes: {
        speed: 15,
        initialSize: 10,
        bodyStart: [7, 4, 'left'],
        initialDirection: 'right',
        reverse: false,

        players: [
            {
                color: "#000000",
                bodyStart: [8, 4, 'up'],
                keyMap: {left: "ArrowLeft", right: "ArrowRight", up: "ArrowUp", down: "ArrowDown"}
            },
            {
                color: "#ff0000",
                bodyStart: [6, 6, 'left'],
                keyMap: {left: "a", right: "d", up: "w", down: "s"}
            },
            {
                color: "#00ff00",
                bodyStart: [7, 8, 'left'],
                keyMap: {left: "j", right: "l", up: "i", down: "k"}
            }
        ]
    },

    foods: {
        qnt: 1,

        types: {
            normal: {
                chance: 5,
                color: '#FFE400'
            },

            freezer: {
                chance: 0,
                color: '#008F30'
            },

            superSpeed: {
                chance: 0,
                color: '#008F30'
            }
        }

    }

}