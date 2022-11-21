var cache = require('./cache');

module.exports = function(params) {
    //console.log(cache.list({includeStale: false}));
    //console.log(cache.list({includeStale: false}).hasOwnProperty(params.toUpperCase()));
    cache.deleteServer(params);
}