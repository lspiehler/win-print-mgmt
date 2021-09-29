const printer = require('../../../lib/printer');

module.exports = function(params, callback) {
    //console.log(params);
    printer.queue.create(params, function(err, resp) {
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
                body: JSON.parse(resp.body)
            }
            callback(false, result);
        }
    });
}