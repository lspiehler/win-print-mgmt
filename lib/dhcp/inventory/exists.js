var cache = require('./cache');

module.exports = function(params) {
    //console.log(cache.list({includeStale: false}));
    //console.log(cache.list({includeStale: false}).hasOwnProperty(params.toUpperCase()));
    let list = cache.list({includeStale: false});
    if(list.hasOwnProperty(params.toUpperCase())) {
        //console.log('SHOULD BE HERE');
        return list[params.toUpperCase()];
    } else {
        //console.log('WE ARE HERE');
        return false;
    }
}