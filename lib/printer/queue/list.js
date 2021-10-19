const https = require('../../https');
const server = require('../../server');

module.exports = function() {
    var drivers = {};
    var responses = [];
    var params;
    var finalcallback;
    var searchkeys;
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

    var findMatch = function(search, property) {
        if(!search) {
            return true;
        }
        let matches = 0;
        //console.log(compop);
        if(!searchkeys) {
            searchkeys = Object.keys(search.properties)
        }
        for(let i = 0; i <= searchkeys.length - 1; i++) {
            /*console.log('-------------');
            console.log(property[searchkeys[i]]);
            console.log(search.properties[searchkeys[i]]);
            console.log(property[searchkeys[i]].indexOf(search.properties[searchkeys[i]]));
            console.log('-------------');*/
            if(property[searchkeys[i]].toUpperCase().indexOf(search.properties[searchkeys[i]].toUpperCase()) >= 0) {
                if(search.comparison.toUpperCase() == 'AND') {
                    matches++;
                } else {
                    return true;
                }
            }
        }
        if(matches == searchkeys.length) {
            return true;
        } else {
            return false;
        }
    }

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
                if(findMatch(params.search, response['data'][keys[j]])) {
                    if(params.combine && drivers.hasOwnProperty(keys[j])) {
                        drivers[keys[j]].Servers.push(responses[i].options.host);
                        drivers[keys[j]].JobCount = drivers[keys[j]].JobCount + parseInt(response['data'][keys[j]].JobCount);
                    } else {
                        //console.log(response['data'][keys[j]]);
                        //console.log(params.search);
                        drivers[keys[j]] = response['data'][keys[j]];
                        drivers[keys[j]].Servers = [responses[i].options.host]
                        drivers[keys[j]].JobCount = parseInt(response['data'][keys[j]].JobCount);
                    }
                }
                //console.log(keys[j]);
                //console.log(responses[i].options.host);
            }
        }
        let printerarray = [];
        let driverkeys = Object.keys(drivers);
        for(let i = 0; i <= driverkeys.length - 1; i++) {
            drivers[driverkeys[i]].uid = 'respid-' + i;
            printerarray.push(drivers[driverkeys[i]])
        }
        finalcallback(false, printerarray);
    }

    var addResponse = function(response) {
        responses.push(response);
        //console.log(response);
        if(responses.length >= params.servers.length) {
            processResponses();
        }
    }
    
    this.query = function(reqparams, callback) {
        params = reqparams;
        //console.log(servers);
        finalcallback = callback;
        for(let i = 0; i <= params.servers.length - 1; i++) {
            let inventoryobj = server.inventory.exists(params.servers[i]);
            let options = {
                host: params.servers[i],
                port: inventoryobj.port,
                path: '/api/printer/queue/list',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
    
            https.request({ options: options, body: params }, function(err, resp) {
                //console.log(resp);
                addResponse(resp);
            });
        }
        //callback(false, params);
    }
}