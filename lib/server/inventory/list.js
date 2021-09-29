var cache = require('./cache');

module.exports = function(params, callback) {
    callback(false, cache);
}