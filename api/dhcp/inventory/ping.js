const dhcplib = require('../../../lib/dhcp');

module.exports = function(params, callback) {
    dhcplib.inventory.ping(params, function(err, resp) {
        if(err) {
            let result = {
                status: 500,
                headers: [],
                body: {
                    result: 'error',
                    message: err,
                    data: null
                }
            }
            callback(err, result);
        } else {
            let result = {
                status: 200,
                headers: [],
                body: {
                    result: 'success',
                    message: err,
                    data: resp
                }
            }
            callback(false, result);
        }
    });
}