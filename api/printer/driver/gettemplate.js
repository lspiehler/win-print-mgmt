const printer = require('../../../lib/printer');

var templates = {
    "Dell Printer Driver v2": [
        false,
        {
            options: {
                dmDefaultSource: 1
            }
        },
        {
            options: {
                dmDefaultSource: 2
            }
        },
        {
            options: {
                dmDefaultSource: 3
            }
        }
    ],
    "Dell Printer Driver v2": [
        false,
        {
            options: {
                dmDefaultSource: 1
            }
        },
        {
            options: {
                dmDefaultSource: 2
            }
        },
        {
            options: {
                dmDefaultSource: 3
            }
        }
    ],
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
    ],
    "Canon Generic UFR II Driver": [
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
    ],
    "HP Universal Printing PCL 6": [
        false,
        {
            options: {
                dmDefaultSource: 259
            }
        },
        {
            options: {
                dmDefaultSource: 260
            }
        },
        {
            options: {
                dmDefaultSource: 261
            }
        },
        {
            options: {
                dmDefaultSource: 262
            }
        }
    ],
    "HP Universal Printing PCL 5": [
        false,
        {
            options: {
                dmDefaultSource: 259
            }
        },
        {
            options: {
                dmDefaultSource: 260
            }
        },
        {
            options: {
                dmDefaultSource: 261
            }
        }
    ]
}

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