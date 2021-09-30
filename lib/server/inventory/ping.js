var cache = require('./cache');

module.exports = function(params, callback) {
    //console.log(params);
    let action;
    if(cache.list({includeStale: true}).hasOwnProperty(params.name.toUpperCase())) {
        //callback(false, 'server updated');
        action = 'updated';
    } else {
        //callback(false, 'server added');
        action = 'added';
    }
    params.lastPing = new Date();
    cache.addServer(params);
    callback(false, 'server ' + action);
}