const server = require('../../../lib/server');

module.exports = function(params, callback) {
    server.inventory.list(params, function(err, inventory) {
        if(err) {
            callback(err, false);
        } else {
            callback(false, inventory);
        }
    });
}