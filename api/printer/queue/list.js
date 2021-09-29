const printer = require('../../../lib/printer');

module.exports = function(params, callback) {
    printer.queue.list(params, function(err, resp) {
        if(err) {
            callback(err, false);
        } else {
            callback(false, resp);
        }
    });
}