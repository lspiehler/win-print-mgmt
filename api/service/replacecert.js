const service = require('../../lib/service');

module.exports = function(params, callback) {
    service.replaceCert(params, function(err, response) {
        if(err) {
            let resp = {
                status: 500,
                headers: [],
                body: {
                    result: 'error',
                    message: err,
                    data: null
                }
            }
            callback(false, resp);
        } else {
            let resp = {
                status: 200,
                headers: [],
                body: {
                    result: 'success',
                    message: 'Certificates replaced successfully',
                    data: response
                }
            }
            callback(false, resp);
        }
    });
}