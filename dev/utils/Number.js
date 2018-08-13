Number.prototype.isEqual = function(...values){

    for(let i = 0, L = values.length; i < L; i++){

        if(this == values[i]) return true;

    }

    return false;

}