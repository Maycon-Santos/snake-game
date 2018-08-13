var gameProps = {
    tiles: [64, 36], // X, Y

    snakes: {
        speed: 15,
        initialSize: 1,
        initialDirection: "right",
        reverse: false,
        sensibilityTouch: 30, // the higher, the less sensitive

        keyMaps: [
            {left: "ArrowLeft", right: "ArrowRight", up: "ArrowUp", down: "ArrowDown"},
            {left: "a", right: "d", up: "w", down: "s"}
        ],

        colors: [
            '#000000',
            'DimGray',
            'HotPink',
            'Brown',
            'DarkBlue',
            'RosyBrown',
            'Chocolate',
            'AliceBlue',
            'Goldenrod'
        ]
    },

    foods: {
        qnt: 1,

        types: {
            normal: {
                chance: 30,
                color: '#FFE400'
            },

            superSlow: {
                chance: 3,
                color: '#af3907',
                powerup: 'super slow'
            },

            superSpeed: {
                chance: 3,
                color: '#0f8660',
                powerup: 'super speed'
            },

            superIncrease: {
                chance: 3,
                color: '#29002d',
                powerup: 'super increase'
            },
            
            freeze: {
                chance: 0,
                color: '#076f96',
                powerup: 'freeze'
            },

            invisible: {
                chance: 0,
                color: '#a607af'
            }

        }

    }

}