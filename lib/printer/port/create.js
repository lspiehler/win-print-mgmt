const https = require('../../https');
const server = require('../../server');
const wsmq = require('../../websocket/messageQueue');

module.exports = function(params, callback) {
    let inventoryobj = server.inventory.exists(params.server)
    if(inventoryobj) {
        let options;
        if(inventoryobj.type=="websocket") {
            options = {
                uuid: inventoryobj.connid,
                message: {
                    type: 'request',
                    body: {
                        path: '/printer/port/create',
                        options: params
                    }
                }
            }
            wsmq.sendMessage(options, function(err, resp) {
                let res = {
                    options: {
                        host: inventoryobj.name
                    },
                    statusCode: 201,
                    body: resp
                }
                callback(false, res);
            });
        } else {
            options = {
                host: params.server,
                port: inventoryobj.port,
                path: '/api/printer/port/create',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            https.request({ options: options, body: params }, function(err, resp) {
                if(err) {
                    callback(err, false);
                } else {
                    let body;
                    try {
                        body = JSON.parse(resp.body)
                        resp.body = body;
                        //console.log(resp);
                        callback(false, resp);
                    } catch(e) {
                        callback(resp.body, false)
                    }
                }
            });
        }
    } else {
        callback(params.server + ' is not a managed print server', false);
    }
}