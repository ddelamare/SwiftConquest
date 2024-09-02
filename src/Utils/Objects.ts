// https://stackoverflow.com/a/48633637
const Extend = function<Type> (options :  Type, defaultOptions : Type) {
    return {...defaultOptions, ...options}
}

export { Extend }