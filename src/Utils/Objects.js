// https://stackoverflow.com/a/48633637
const Extend = function (options, defaultOptions) {
    return {...defaultOptions, ...options};
}

export { Extend }