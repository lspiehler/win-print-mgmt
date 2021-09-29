var cache = require('./cache');

module.exports = function(params) {
    if(cache.hasOwnProperty(params.toUpperCase())) {
        return cache[params.toUpperCase()];
    } else {
        return false;
    }
}