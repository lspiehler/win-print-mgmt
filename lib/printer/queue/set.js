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
                timeout: 600000,
                message: {
                    type: 'request',
                    body: {
                        path: '/printer/queue/set',
                        options: params
                    }
                }
            }
            wsmq.sendMessage(options, function(err, resp) {
                let res = {
                    options: {
                        host: inventoryobj.name
                    },
                    body: resp
                }
                //console.log(res);
                callback(false, res);
            });
        } else {
            options = {
                host: params.server,
                port: inventoryobj.port,
                path: '/api/printer/queue/set',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            https.request({ options: options, body: params }, function(err, resp) {
                if(err) {
                    callback(err, false);
                } else {
                    resp.body = JSON.parse(resp.body);
                    callback(false, resp);
                }
            });
        }
    } else {
        callback(params.server + ' is not a managed print server', false);
    }
}