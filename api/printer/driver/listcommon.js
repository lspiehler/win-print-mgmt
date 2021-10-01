const printer = require('../../../lib/printer');

module.exports = function(params, callback) {
    let listcommon = new printer.driver.listcommon();
    listcommon.query(params, function(err, resp) {
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
                status: 200,
                headers: [],
                body: resp
            }
            callback(false, result);
        }
    });
}