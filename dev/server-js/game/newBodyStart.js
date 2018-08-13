const newBodyStart = id =>{

    id++;

    // Reset the "counter" to every 3 numbers (4 = 1, 7 = 1, 8 = 2 ...)
    // Ex: (4 / 3.0001) = 1.3332888903703208
    //     (1.333288... % 1) = 0.333288...
    //     (0.333288... * 3) = 0.99986667...
    //     Math.round(0.99986667...) = 1
    let xMultiplier = Math.round(((id / 3.0001) % 1) * 3),
        yMultiplier = Math.ceil(id / 3);

    io.emit('teste', xMultiplier);

    return [16 * xMultiplier, 9 * yMultiplier, 'down'];

}