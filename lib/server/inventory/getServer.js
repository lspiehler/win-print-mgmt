var cache = require('./cache');

module.exports = function(name) {
    return cache.getServer(name);
}