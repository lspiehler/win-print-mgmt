const printer = require('../../../lib/printer');
const templates = require('../../../template/template');

module.exports = function(params, callback) {
    //console.log(params);
    if(templates.hasOwnProperty(params.server) || params.server == 'all') {
        let result;
        if(params.server == 'all') {
            result = {
                status: 200,
                headers: [],
                body: {
                    result: 'success',
                    message: null,
                    data: templates
                }
            }
        } else {
            result = {
                status: 200,
                headers: [],
                body: {
                    result: 'success',
                    message: null,
                    data: templates[params.server]
                }
            }
        }
        callback(false, result);
    } else {
        let result = {
            status: 404,
            headers: [],
            body: {
                result: 'error',
                message: 'Template not found for driver',
                data: null
            }
        }
        callback(false, result);
    }
}