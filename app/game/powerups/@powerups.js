const powerups = new function(){

    this.set = (powerupName, func) =>
        this[powerupName] = func;

}