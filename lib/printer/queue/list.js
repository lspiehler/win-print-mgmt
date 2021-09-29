const https = require('../../https');
const server = require('../../server');

module.exports = function(params, callback) {
    let inventoryobj = server.inventory.exists(params.server)
    if(inventoryobj) {
        let options = {
            host: params.server,
            port: inventoryobj.port,
            path: '/api/printer/queue/list',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }

        https.request({ options: options }, function(err, resp) {
            if(err) {
                callback(err, false);
            } else {
                console.log(resp);
                callback(false, JSON.parse(resp.body));
            }
        });
    } else {
        callback(params.server + ' is not a managed print server', false);
    }
}