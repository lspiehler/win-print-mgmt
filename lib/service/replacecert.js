const https = require('../https');
const server = require('../server');
const inventory = require('../dhcp/inventory');

module.exports = function(params, callback) {
    let inventoryobj;
    inventoryobj = server.inventory.exists(params.server)
    if(inventoryobj) {

    } else {
        inventoryobj = inventory.exists(params.server)
    }
    if(inventoryobj) {
        let options = {
            host: params.server,
            port: inventoryobj.port,
            path: '/api/service/cert/new',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }

        https.request({ options: options, body: params }, function(err, resp) {
            if(err) {
                callback(err, false);
            } else {
                callback(false, resp);
            }
        });
    } else {
        callback(params.server + ' is not a managed server', false);
    }
}