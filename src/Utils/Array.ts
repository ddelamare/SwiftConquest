
const FindElementById = function(array : any[], id){
    return array.flat(Infinity).find((elem) =>  elem.id === id);
}

export { FindElementById }