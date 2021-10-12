const printer = require('../../../lib/printer');

var templates = {
    "Canon Generic PCL6 Driver": [
        {
            options: {
                dmDuplex: 1,
                dmColor: 1
            }
        },
        {
            options: {
                dmDefaultSource: 1,
                dmDuplex: 1,
                dmColor: 1
            }
        },
        {
            options: {
                dmDefaultSource: 3,
                dmDuplex: 1,
                dmColor: 1
            }
        },
        {
            options: {
                dmDefaultSource: 2,
                dmDuplex: 1,
                dmColor: 1
            }
        },
        {
            options: {
                dmDefaultSource: 264,
                dmDuplex: 1,
                dmColor: 1
            }
        }
    ]
}

module.exports = function(params, callback) {
    //console.log(params);
    if(templates.hasOwnProperty(params.server)) {
        let result = {
            status: 200,
            headers: [],
            body: {
                result: 'success',
                message: null,
                data: templates[params.server]
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