Object.prototype.merge = function(object){
    for (const key in object) this[key] = object[key];
}