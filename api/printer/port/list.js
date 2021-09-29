const printer = require('../../../lib/printer');

module.exports = function(params, callback) {
    printer.port.list(params, function(err, ports) {
        if(err) {
            callback(err, false);
        } else {
            callback(false, ports);
        }
    });
}