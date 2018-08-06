const powerups = new function(){

    var powerups = {};

    const exec = pu => function(snake, game){

        for(let i = 0, L = powerups[pu].length; i < L; i++)
            powerups[pu][i](snake, game);

    }

    this.on = (powerupName, func) =>{
        
        if(!powerups[powerupName])
            powerups[powerupName] = [];

        powerups[powerupName].push(func);

        this[powerupName] = exec(powerupName);

    }

}