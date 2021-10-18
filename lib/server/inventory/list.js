var cache = require('./cache');
const moment = require('moment');

module.exports = function(params, callback) {
    if(params.includeStale) {
        callback(false, cache.list());
    } else {
        let freshcache = [];
        let list = cache.list();
        let keys = Object.keys(list);
        let now = moment(new Date());
        for(let i = 0; i <= keys.length - 1; i++) {
            if(now.diff(list[keys[i]].lastPing, 'seconds') <= 10) {
                freshcache.push(list[keys[i]]);
            }
        }
        //freshcache.sort();
        callback(false, freshcache);
    }
}