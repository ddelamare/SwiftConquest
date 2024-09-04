// https://stackoverflow.com/a/48633637
const Extend = function<Type> (options :  Type, defaultOptions : Type) {
    return {...defaultOptions, ...options}
}

const GetUniqueId = function() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

const KeysAsArray = function(obj : any) {
    return Object.keys(obj).map((key) => obj[key]);
}

const UnwrapProxy = function(prox : any ){
    return JSON.parse(JSON.stringify(prox));
}

export { Extend, GetUniqueId, KeysAsArray, UnwrapProxy }