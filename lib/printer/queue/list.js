const https = require('../../https');
const server = require('../../server');
const lease = require('../../dhcp/lease');
const wsmq = require('../../websocket/messageQueue');

module.exports = function() {
    var drivers = {};
    var responses = [];
    var leases;
    var params;
    var finalcallback;
    var searchkeys;
    var processed = false;
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

    var includeLeases = function() {
        if(params.includeleases===true) {
            let query = {
                "servers": 'all',
                "index": "IPAddress",
                "combine": true,
                "hashtable": true,
                "search": false,
                "updatecache": params.updatecache
            }
            new lease.list().query(query, function(err, resp) {
                //console.log(resp);
                leases = resp;
                if(responses.length >= params.servers.length) {
                    if(!processed) {
                        processResponses();
                    }
                }
                return;
            });
        } else {
            return;
        }
    }

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
        'PrinterHostAddress',
        'PortName',
        'DriverName',
        'Location',
        'Comment',
        'Shared',
        'ShareName'
    ]

    var processResponses = function() {
        processed = true;
        let printerarray = [];
        let uid = 0;
        for(let i = 0; i <= responses.length - 1; i++) {
            //console.log(responses[i].body);
            //let response = JSON.parse(responses[i].body);
            let response = responses[i].body;
            if(response.result != 'success') {
                finalcallback(response, false);
                return;
            }
            let keys = Object.keys(response.data);
            for(let j = 0; j <= keys.length - 1; j++) {
                let statusprop = 'PrinterStatus';
                if(response['data'][keys[j]].useWMI) {
                    statusprop = 'PrinterState';
                }
                //console.log(response['data'][keys[j]].Name + ' ' + parseInt(response['data'][keys[j]][statusprop]) + ' ' + response['data'][keys[j]]['useWMI']);
                if(findMatch(params.search, response['data'][keys[j]])) {
                    let status = [];
                    let statusbits = parseInt(response['data'][keys[j]][statusprop]).toString(2);
                    let bitindex = 1;
                    for(let l = statusbits.length - 1; l >= 0; l--) {
                        let getstatus = parseInt(statusbits[l])
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
                                if(drivers[keys[j]]['PrinterStatus'].indexOf(status[k]) < 0) {
                                    drivers[keys[j]]['PrinterStatus'].push(status[k]);
                                }
                            }
                            if(params.includeleases) {
                                if(response['data'][keys[j]].PrinterHostAddress) {
                                    if(leases.hasOwnProperty(response['data'][keys[j]].PrinterHostAddress)) {
                                        //console.log(leases[response['data'][keys[j]].PortName]);
                                        //console.log(drivers[keys[j]]);
                                        if(drivers[keys[j]].DHCPAddressState.hasOwnProperty(response['data'][keys[j]].PrinterHostAddress)) {
                                            //this happens when the same queue is discovered on multiple servers an identical IP, which is what is desired
                                        } else {
                                            drivers[keys[j]].DHCPAddressState[response['data'][keys[j]].PrinterHostAddress] = leases[response['data'][keys[j]].PrinterHostAddress].AddressState;
                                        }
                                        if(drivers[keys[j]].DHCPScopeId.indexOf(leases[response['data'][keys[j]].PrinterHostAddress].ScopeId) < 0) {
                                            drivers[keys[j]].DHCPScopeId.push(leases[response['data'][keys[j]].PrinterHostAddress].ScopeId);
                                        }
                                        if(drivers[keys[j]].DHCPServers.indexOf(leases[response['data'][keys[j]].PrinterHostAddress].Servers) < 0) {
                                            drivers[keys[j]].DHCPServers.push(leases[response['data'][keys[j]].PrinterHostAddress].Servers);
                                        }
                                        //console.log(response['data'][keys[j]]);
                                    } else {
                                        drivers[keys[j]].DHCPAddressState[response['data'][keys[j]].PrinterHostAddress] = 'N/A'
                                    }
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
                            drivers[keys[j]].Servers = [responses[i].options.host];

                            drivers[keys[j]].DHCPAddressState = {};
                            drivers[keys[j]].DHCPScopeId = [];
                            drivers[keys[j]].DHCPServers = [];

                            if(params.includeleases) {
                                if(response['data'][keys[j]].PrinterHostAddress) {
                                    if(leases.hasOwnProperty(response['data'][keys[j]].PrinterHostAddress)) {
                                        //console.log(leases[response['data'][keys[j]].PortName]);
                                        drivers[keys[j]].DHCPAddressState[response['data'][keys[j]].PrinterHostAddress] = leases[response['data'][keys[j]].PrinterHostAddress].AddressState;
                                        drivers[keys[j]].DHCPScopeId.push(leases[response['data'][keys[j]].PrinterHostAddress].ScopeId);
                                        drivers[keys[j]].DHCPServers.push(leases[response['data'][keys[j]].PrinterHostAddress].Servers);
                                        //console.log(response['data'][keys[j]]);
                                    } else {
                                        drivers[keys[j]].DHCPAddressState[response['data'][keys[j]].PrinterHostAddress] = 'N/A'
                                    }
                                }
                            }
                            for(let k = 0; k <= consistencyprops.length - 1; k++) {
                                if(response['data'][keys[j]][consistencyprops[k]] != null) {
                                    drivers[keys[j]][consistencyprops[k]] = [response['data'][keys[j]][consistencyprops[k]]];
                                } else {
                                    drivers[keys[j]][consistencyprops[k]] = [];
                                }
                            }
                            drivers[keys[j]]['PrinterStatus'] = status;
                            drivers[keys[j]].JobCount = parseInt(response['data'][keys[j]].JobCount);
                        }
                    } else {
                        response['data'][keys[j]].uid = 'respid-' + uid;
                        response['data'][keys[j]].Servers = [responses[i].options.host];
                        //console.log(response['data'][keys[j]]);
                        response['data'][keys[j]].DHCPAddressState = {};
                        response['data'][keys[j]].DHCPScopeId = [];
                        response['data'][keys[j]].DHCPServers = [];
                        if(params.includeleases) {
                            if(response['data'][keys[j]].PrinterHostAddress) {
                                if(leases.hasOwnProperty(response['data'][keys[j]].PrinterHostAddress)) {
                                    //console.log(leases[response['data'][keys[j]].PortName]);
                                    response['data'][keys[j]].DHCPAddressState[response['data'][keys[j]].PrinterHostAddress] = leases[response['data'][keys[j]].PrinterHostAddress].AddressState;
                                    response['data'][keys[j]].DHCPScopeId.push(leases[response['data'][keys[j]].PrinterHostAddress].ScopeId);
                                    response['data'][keys[j]].DHCPServers.push(leases[response['data'][keys[j]].PrinterHostAddress].Servers);
                                    //console.log(response['data'][keys[j]]);
                                } else {
                                    response['data'][keys[j]].DHCPAddressState[response['data'][keys[j]].PrinterHostAddress] = 'N/A';
                                }
                            }
                        }
                        for(let k = 0; k <= consistencyprops.length - 1; k++) {
                            if(response['data'][keys[j]][consistencyprops[k]] != null) {
                                response['data'][keys[j]][consistencyprops[k]] = [response['data'][keys[j]][consistencyprops[k]]];
                            } else {
                                response['data'][keys[j]][consistencyprops[k]] = [];
                            }
                        }
                        response['data'][keys[j]]['PrinterStatus'] = status;
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
        //console.log('test');
        finalcallback(false, printerarray);
    }

    var addResponse = function(response) {
        responses.push(response);
        //console.log(response);
        if(responses.length >= params.servers.length) {
            if(params.includeleases) {
                if(leases) {
                    if(!processed) {
                        processResponses();
                    }
                }
            } else {
                if(!processed) {
                    processResponses();
                }
            }
        }
    }
    
    this.query = function(reqparams, callback) {
        params = reqparams;
        //params.includeleases = true;
        //console.log(servers);
        finalcallback = callback;
        for(let i = 0; i <= params.servers.length - 1; i++) {
            let inventoryobj = server.inventory.exists(params.servers[i]);
            let options;

            includeLeases();
            if(inventoryobj.type=="websocket") {
                options = {
                    uuid: inventoryobj.connid,
                    timeout: 120000,
                    message: {
                        type: 'request',
                        body: {
                            path: '/printer/queue/list',
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
                    addResponse(res);
                });
            } else {
                options = {
                    host: params.servers[i],
                    port: inventoryobj.port,
                    path: '/api/printer/queue/list',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
                https.request({ options: options, body: params }, function(err, resp) {
                    resp.body = JSON.parse(resp.body);
                    //console.log(resp.body);
                    addResponse(resp);
                });
            }
        }
        //callback(false, params);
    }
}