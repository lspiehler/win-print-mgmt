const printer = require('../../../lib/printer');

module.exports = function(params, callback) {
    printer.port.create(params, function(err, resp) {
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
            //console.log(resp);
            let result = {
                status: resp.statusCode,
                headers: [],
                body: resp.body
            }
            callback(false, result);
        }
    });
}