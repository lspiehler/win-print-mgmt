const server = require('../../../lib/server');

module.exports = function(params, callback) {
    server.inventory.list(params, function(err, inventory) {
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
                    data: inventory
                }
            }
            callback(false, result);
        }
    });
}