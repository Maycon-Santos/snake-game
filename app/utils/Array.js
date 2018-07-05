Array.prototype.isEqual = function(arr){

    return JSON.stringify(this) === JSON.stringify(arr);

}

Array.prototype.sumWith = function(...arrays){
    var arrays = [this, ...arrays].sort((a, b) => b.length - a.length), // Order by DESC
        newArray = [...arrays[0]]; // Largest array of the list

    for (let i = 1, arrLeng = arrays.length; i < arrLeng; i++) {
        const array = arrays[i];
        for (let j = 0, itemLeng = array.length; j < itemLeng; j++) {
            const item = array[j];
            newArray[j] += item;
        }
    }

    return newArray;
}

Array.prototype.sumAll = function(){
    return this.reduce((total, sum) => total + sum, 0);
}

Array.prototype.lastItem = function(){

    return this[this.length - 1];

}