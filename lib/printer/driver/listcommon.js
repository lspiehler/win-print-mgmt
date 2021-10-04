const https = require('../../https');
const server = require('../../server');

module.exports = function() {
    var drivers = {};
    var responses = [];
    var servers;
    var finalcallback;
    /*let inventoryobj = server.inventory.exists(params.server)
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
                callback(false, resp);
            }
        });
    } else {
        callback(params.server + ' is not a managed print server', false);
    }*/

    var processResponses = function() {
        for(let i = 0; i <= responses.length - 1; i++) {
            //console.log(responses[i].options.host);
            let response = JSON.parse(responses[i].body);
            if(response.result != 'success') {
                finalcallback(response, false);
                return;
            }
            let keys = Object.keys(response.data);
            for(let j = 0; j <= keys.length - 1; j++) {
                if(drivers.hasOwnProperty(keys[j])) {
                    drivers[keys[j]].servers.push(responses[i].options.host);
                } else {
                    drivers[keys[j]] = {
                        servers: [responses[i].options.host]
                    };
                }
                //console.log(keys[j]);
                //console.log(responses[i].options.host);
            }
        }
        let common = [];
        let driverkeys = Object.keys(drivers);
        for(let i = 0; i <= driverkeys.length - 1; i++) {
            if(drivers[driverkeys[i]].servers.length >= responses.length) {
                common.push(driverkeys[i])
            }
        }
        finalcallback(false, common);
    }

    var addResponse = function(response) {
        responses.push(response);
        if(responses.length >= servers.length) {
            processResponses();
        }
    }
    
    this.query = function(params, callback) {
        servers = params.servers;
        finalcallback = callback;
        for(let i = 0; i <= servers.length - 1; i++) {
            let inventoryobj = server.inventory.exists(servers[i]);
            let options = {
                host: servers[i],
                port: inventoryobj.port,
                path: '/api/printer/driver/list',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
    
            https.request({ options: options, body: params }, function(err, resp) {
                addResponse(resp);
            });
        }
        //callback(false, params);
    }
}