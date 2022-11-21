const https = require('../../https');
const wsmq = require('../../websocket/messageQueue');
const inventory = require('../inventory');

var findMatch = function(params, property) {
    if(!params.search) {
        return true;
    }
    let matches = 0;
    //console.log(compop);
    let searchkeys = Object.keys(params.search.properties)
    for(let i = 0; i <= searchkeys.length - 1; i++) {
        for(let j = 0; j <= params.search.properties[searchkeys[i]].length - 1; j++) {
            /*console.log('-------------');
            console.log(property[searchkeys[i]]);
            console.log(search.properties[searchkeys[i]]);
            console.log(property[searchkeys[i]].indexOf(search.properties[searchkeys[i]]));
            console.log('-------------');*/
            //console.log(search.properties[searchkeys[i]].charAt(0));
            //console.log(search.properties[searchkeys[i]].charAt(-1));
            //console.log(search);
            //console.log(property);
            if(params.exactMatch === true) {
                //console.log(property[searchkeys[i]].split('"')[1].toUpperCase());
                //console.log(search.properties[searchkeys[i]].toUpperCase());
                if(property[searchkeys[i]].toUpperCase() == params.search.properties[searchkeys[i]][j].toUpperCase()) {
                    if(params.search.comparison.toUpperCase() == 'AND') {
                        matches++;
                    } else {
                        return true;
                    }
                }
            } else {
                if(property[searchkeys[i]]) {
                    if(property[searchkeys[i]].toUpperCase().indexOf(params.search.properties[searchkeys[i]][j].toUpperCase()) >= 0) {
                        if(params.search.comparison.toUpperCase() == 'AND') {
                            matches++;
                        } else {
                            return true;
                        }
                    }
                } else {
                    if(params.search.comparison.toUpperCase() == 'AND') {
                        //matches++;
                    } else {
                        return false;
                    }
                }
            }
        }
    }
    if(matches == searchkeys.length) {
        return true;
    } else {
        return false;
    }
}

module.exports = function() {

    var leases = {};
    var responses = [];
    var finalcallback;

    var addResponse = function(servers, response) {
        responses.push(response);
        //console.log(response);
        if(responses.length >= servers.length) {
            processResponses();
            //finalcallback(false, responses);
        }
    }

    var processResponses = function() {
        let leasearray = [];
        let uid = 0;
        let index;
        if(params.index) {
            index = params.index;
        } else {
            index = 'ClientId';
        }
        for(let i = 0; i <= responses.length - 1; i++) {
            //console.log(responses[i].options);
            //let response = JSON.parse(responses[i].body);
            let response = responses[i].body;
            if(response.result != 'success') {
                finalcallback(response, false);
                return;
            }
            let data = {};
            //determine whether index should be used
            //if(params.useIndex===true || params.search.comparison == 'AND' && params.search.properties.hasOwnProperty(index) && params.search.properties[index].charAt(0) == '"' && params.search.properties[index].charAt(params.search.properties[index].length - 1) == '"') {
            if(params.useIndex===true) {
                //console.log('go instasearch!!!');
                for(let j = 0; j <= params.search.properties[index].length - 1; j++) {
                    if(response.data.hasOwnProperty(params.search.properties[index][j])) {
                        data[params.search.properties[index][j]] = response.data[params.search.properties[index][j]];
                    }
                }
            } else {
                data = response.data;
            }
            let keys = Object.keys(data);
            //console.log(params.search);
            for(let j = 0; j <= keys.length - 1; j++) {
                for(let k = 0; k <= data[keys[j]].length - 1; k++) {
                    if(findMatch(params, data[keys[j]][k])) {
                        if(params.combine) {
                            if(leases.hasOwnProperty(keys[j])) {
                                if(leases[keys[j]].Servers.indexOf(responses[i].options.host) < 0) {
                                    //console.log('another server');
                                    leases[keys[j]].Servers.push(responses[i].options.host);
                                }
                                let leasekeys = Object.keys(data[keys[j]][k]);
                                for(let l = 0; l <= leasekeys.length - 1; l++) {
                                    if(leasekeys[l] != index) {
                                        if(leases[keys[j]][leasekeys[l]].indexOf(data[keys[j]][k][leasekeys[l]]) < 0) {
                                            if(data[keys[j]][k][leasekeys[l]] != null) {
                                                //console.log(leases[keys[j]][leasekeys[l]]);
                                                //console.log(leases);
                                                if(leasekeys[l] == 'LeaseExpiryTime') {
                                                    if(data[keys[j]][k][leasekeys[l]]) {
                                                        leases[keys[j]][leasekeys[l]].push(new Date(data[keys[j]][k][leasekeys[l]]));
                                                    } else {
                                                        leases[keys[j]][leasekeys[l]].push(data[keys[j]][k][leasekeys[l]]);
                                                    }
                                                } else {
                                                    leases[keys[j]][leasekeys[l]].push(data[keys[j]][k][leasekeys[l]]);
                                                }
                                            }
                                        }
                                    }
                                }
                            } else {
                                let leasekeys = Object.keys(data[keys[j]][k]);
                                for(let l = 0; l <= leasekeys.length - 1; l++) {
                                    if(leasekeys[l] != index) {
                                        if(leasekeys[l] == 'LeaseExpiryTime') {
                                            if(data[keys[j]][k][leasekeys[l]]) {
                                                data[keys[j]][k][leasekeys[l]] = [new Date(data[keys[j]][k][leasekeys[l]])];
                                            } else {
                                                data[keys[j]][k][leasekeys[l]] = [data[keys[j]][k][leasekeys[l]]];
                                            }
                                        } else {
                                            data[keys[j]][k][leasekeys[l]] = [data[keys[j]][k][leasekeys[l]]];
                                        }
                                    }
                                }
                                data[keys[j]][k].Servers = [responses[i].options.host];
                                data[keys[j]][k].uid = 'respid-' + uid;
                                leases[keys[j]] = data[keys[j]][k];
                                uid++;
                            }
                        } else {
                            let leasekeys = Object.keys(data[keys[j]][k]);
                            for(let l = 0; l <= leasekeys.length - 1; l++) {
                                if(leasekeys[l] != index) {
                                    if(leasekeys[l] == 'LeaseExpiryTime') {
                                        if(data[keys[j]][k][leasekeys[l]]) {
                                            data[keys[j]][k][leasekeys[l]] = [new Date(data[keys[j]][k][leasekeys[l]])];
                                        } else {
                                            data[keys[j]][k][leasekeys[l]] = [data[keys[j]][k][leasekeys[l]]];
                                        }
                                    } else {
                                        data[keys[j]][k][leasekeys[l]] = [data[keys[j]][k][leasekeys[l]]];
                                    }
                                }
                            }
                            data[keys[j]][k].Servers = [responses[i].options.host];
                            data[keys[j]][k].uid = 'respid-' + uid;
                            //leases[keys[j]] = data[keys[j]][k];
                            leasearray.push(data[keys[j]][k])
                            uid++;
                        }
                    }
                }
            }
        }
        if(params.combine) {
            if(params.hashtable===true) {
                finalcallback(false, leases);
            } else {
                let leasekeys = Object.keys(leases);
                for(let i = 0; i <= leasekeys.length - 1; i++) {
                    //leases[leasekeys[i]].uid = 'respid-' + i;
                    leasearray.push(leases[leasekeys[i]])
                }
                finalcallback(false, leasearray);
            }
        } else {
            finalcallback(false, leasearray);
        }
    }
    
    this.query = function(reqparams, callback) {
        //console.log(reqparams);
        inventory.list({includeStale: false}, function(err, dhcpservers) {
            if(err) {
                callback(err, false);
            } else {
                params = reqparams;
                let servers = [];
                if(typeof params.servers == 'object') {
                    servers = params.servers
                } else {
                    if(params.servers == 'all') {
                        for (let i = 0; i < dhcpservers.length; i++) {
                            servers.push(dhcpservers[i].name);
                        }
                    } else {
                        callback('Invalid "servers" property in request');
                    }
                }

                console.log(params);

                //console.log(servers);
                finalcallback = callback;
                let called = false;
                for(let i = 0; i <= servers.length - 1; i++) {
                    let inventoryobj = inventory.exists(servers[i]);
                    if(inventoryobj) {
                        let options;
                        if(inventoryobj.type=="websocket") {
                            //console.log(new Date());
                            options = {
                                uuid: inventoryobj.connid,
                                timeout: 20000,
                                //timeout: 2000,
                                message: {
                                    type: 'request',
                                    body: {
                                        path: '/dhcp/lease/list',
                                        options: params
                                    }
                                }
                            }
                            wsmq.sendMessage(options, function(err, resp) {
                                if(err) {
                                    if(called === false) {
                                        callback(err, false);
                                        called = true;
                                    }
                                    return;
                                } else {
                                    let res = {
                                        options: {
                                            host: inventoryobj.name
                                        },
                                        body: resp
                                    }
                                    //console.log(resp.result);
                                    if(resp.result=="error") {
                                        if(called === false) {
                                            callback("Error from " + inventoryobj.name + ": " + resp.message, false);
                                            called = true;
                                        }
                                        return;
                                    }
                                    addResponse(servers, res);
                                }
                            });
                        } else {
                            options = {
                                host: servers[i],
                                port: inventoryobj.port,
                                path: '/api/dhcp/lease/list',
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }

                            https.request({ options: options, body: params }, function(err, resp) {
                                resp.body = JSON.parse(resp.body);
                                addResponse(servers, resp);
                            });
                        }
                    } else {
                        callback(params.servers[i] + ' is not a managed dhcp server in qManager\'s inventory. This may be because the agent service has stopped on the server.', false);
                        return;
                    }
                }
                //callback(false, params);
            }
        });
    }
}