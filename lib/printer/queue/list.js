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

    let statuses = [
        'Ready',
        'Paused',
        'Error',
        'Deleting',
        'Paper Jam',
        'Out of Paper',
        'Manual Feed',
        'Paper Problem',
        'Offline',
        'IO Active',
        'Busy',
        'Printing',
        'Output Bin Full',
        'Not Available',
        'Waiting',
        'Processing',
        'Initializing',
        'Warming Up',
        'Toner Low',
        'No Toner',
        'Page Punt',
        'User Intervention',
        'Out of Memory',
        'Door Open',
        'Server Unknown',
        'Power Save'
    ]

    consistencyprops = [
        'PortName',
        'DriverName',
        'Location',
        'Comment',
        'Shared',
        'ShareName'
    ]

    var processResponses = function() {
        let printerarray = [];
        let uid = 0;
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
                    let status = [];
                    let statusbits = response['data'][keys[j]].PrinterStatus.toString(2);
                    let bitindex = 1;
                    for(let i = statusbits.length - 1; i >= 0; i--) {
                        let getstatus = parseInt(statusbits[i])
                        if(getstatus==1) {
                            status.push(statuses[bitindex]);
                        }
                        bitindex++;
                    }
                    if(status.length==0) {
                        status.push(statuses[0]);
                    }
                    if(params.combine) {
                        if(drivers.hasOwnProperty(keys[j])) {
                            drivers[keys[j]].Servers.push(responses[i].options.host);
                            drivers[keys[j]].JobCount = drivers[keys[j]].JobCount + parseInt(response['data'][keys[j]].JobCount);
                            for(let k = 0; k <= status.length - 1; k++) {
                                if(drivers[keys[j]].PrinterStatus.indexOf(status[k]) < 0) {
                                    drivers[keys[j]].PrinterStatus.push(status[k]);
                                }
                            }
                            for(let k = 0; k <= consistencyprops.length - 1; k++) {
                                if(drivers[keys[j]][consistencyprops[k]].indexOf(response['data'][keys[j]][consistencyprops[k]]) < 0) {
                                    if(response['data'][keys[j]][consistencyprops[k]] != null) {
                                        drivers[keys[j]][consistencyprops[k]].push(response['data'][keys[j]][consistencyprops[k]]);
                                    }
                                }
                            }
                        } else {
                            //console.log(response['data'][keys[j]]);
                            //console.log(params.search);
                            drivers[keys[j]] = response['data'][keys[j]];
                            drivers[keys[j]].Servers = [responses[i].options.host]
                            for(let k = 0; k <= consistencyprops.length - 1; k++) {
                                if(response['data'][keys[j]][consistencyprops[k]] != null) {
                                    drivers[keys[j]][consistencyprops[k]] = [response['data'][keys[j]][consistencyprops[k]]];
                                } else {
                                    drivers[keys[j]][consistencyprops[k]] = [];
                                }
                            }
                            drivers[keys[j]].PrinterStatus = status;
                            drivers[keys[j]].JobCount = parseInt(response['data'][keys[j]].JobCount);
                        }
                    } else {
                        response['data'][keys[j]].uid = 'respid-' + uid;
                        response['data'][keys[j]].Servers = [responses[i].options.host];
                        for(let k = 0; k <= consistencyprops.length - 1; k++) {
                            if(response['data'][keys[j]][consistencyprops[k]] != null) {
                                response['data'][keys[j]][consistencyprops[k]] = [response['data'][keys[j]][consistencyprops[k]]];
                            } else {
                                response['data'][keys[j]][consistencyprops[k]] = [];
                            }
                        }
                        response['data'][keys[j]].PrinterStatus = status;
                        printerarray.push(response['data'][keys[j]])
                        uid++;
                        //console.log(response['data'][keys[j]]);
                    }
                }
                //console.log(keys[j]);
                //console.log(responses[i].options.host);
            }
        }
        if(params.combine) {
            let driverkeys = Object.keys(drivers);
            for(let i = 0; i <= driverkeys.length - 1; i++) {
                drivers[driverkeys[i]].uid = 'respid-' + i;
                printerarray.push(drivers[driverkeys[i]])
            }
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