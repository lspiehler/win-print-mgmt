const https = require('../../https');
const dhcpinventory = require('../inventory');
const wsmq = require('../../websocket/messageQueue');

module.exports = function(params, callback) {
    let inventoryobj = dhcpinventory.exists(params.server)
    if(inventoryobj) {
        let options;
        if(inventoryobj.type=="websocket") {
            options = {
                uuid: inventoryobj.connid,
                timeout: 10000,
                message: {
                    type: 'request',
                    body: {
                        path: '/dhcp/lease/reserve',
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
                path: '/api/dhcp/lease/reserve',
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
        callback(params.server + ' is not a managed dhcp server', false);
    }
}