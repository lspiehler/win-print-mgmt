const https = require('../../https');
const server = require('../../server');

module.exports = function(params, callback) {
    let inventoryobj = server.inventory.exists(params.server)
    if(inventoryobj) {
        let options = {
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
                    callback(false, resp);
                } catch(e) {
                    callback(resp.body, false)
                }
            }
        });
    } else {
        callback(params.server + ' is not a managed print server', false);
    }
}