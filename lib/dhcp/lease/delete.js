const https = require('../../https');
const dhcpinventory = require('../inventory');

module.exports = function(params, callback) {
    let inventoryobj = dhcpinventory.exists(params.server)
    if(inventoryobj) {
        let options = {
            host: params.server,
            port: inventoryobj.port,
            path: '/api/dhcp/lease/delete',
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
        callback(params.server + ' is not a managed dhcp server', false);
    }
}