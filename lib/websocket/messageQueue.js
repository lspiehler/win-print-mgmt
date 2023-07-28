const wsServer = require('./service');
const serverlib = require('../../lib/server');
const dhcpinventorylib = require('../../lib/dhcp/inventory');
const config = require('../../config');
const emaillib = require('../email');
//const zlib = require("zlib");
var StringDecoder = require('string_decoder').StringDecoder;

const { v4: uuidv4 } = require('uuid');
const { request } = require('express');
const { Console } = require('console');

var wsconnections = {};
var wsrequests = {};

function pingClients() {
    let clients = Object.keys(wsconnections);

    for(let i = 0; i < clients.length; i++) {
        //console.log(wsconnections[clients[i].id]);
        sendMessage({
            uuid: wsconnections[clients[i]].id,
            message: {
                type: 'ping'
                //body: 'register'
            }}, function(err, resp) {
                //console.log('here');
                //console.log(resp);
                if(err) {
                    console.log(err);
                } else {
                    //console.log(wsconnections[clients[i]]);
                }
            }
        );
    }
    setTimeout(function() {
        pingClients();
    }, 4000)
}

pingClients();

function showConnections() {
    setTimeout(function() {
        console.log(wsconnections)
        showConnections();
    }, 2000);
}

function toArrayBuffer(buffer) {
    var arrayBuffer = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(arrayBuffer);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
        return arrayBuffer;
    }

//showConnections();

function sendMessage(params, callback) {
    if(wsconnections.hasOwnProperty(params.uuid)) {
        // do a settimeout here
        let timeout;
        if(params.hasOwnProperty('timeout')) {
            timeout = params.timeout;
        } else {
            timeout = 60000;
        }
        //console.log(timeout);
        //console.log(params);
        if(params.message.type == 'request') {
            let msguuid = uuidv4();
            wsrequests[msguuid] = {
                callback: callback,
                socketid: params.uuid,
                timeout: setTimeout(function() {
                    console.log(new Date());
                    console.log(timeout);
                    console.log(params);
                    callback('Websocket timed out waiting for a response from ' + wsconnections[params.uuid].inventory, false);
                    delete wsrequests[msguuid];
                }, timeout)
            }
            //console.log(wsrequests);
            params.message.id = msguuid;
        } else {
            callback(false, null);
        }
        wsconnections[params.uuid].socket.send(JSON.stringify(params.message));
    } else {
        callback('a connection with uuid ' + params.uuid + ' does not exist', false);
    }
}

wsServer.on('connection', function(socket, request) {
    let connuuid = uuidv4();
    console.log(connuuid + " - " + request.socket.remoteAddress);
    wsconnections[connuuid] = {
        id: connuuid,
        inventory: null,
        url: request.url,
        socket: socket
    }

    sendMessage({
        uuid: connuuid,
        timeout: 5000,
        message: {
            type: 'request',
            body: {
                path: '/register'
            }
        }}, function(err, inventoryresp) {
            //console.log('here');
            //console.log(inventoryresp);
            if(err) {
                console.log(err);
                console.log('Closing websocket');
                socket.close();
            } else {
                let agenttype = "print";
                if(inventoryresp.data.agentType) {
                    agenttype = inventoryresp.data.agentType
                }
                let params = {
                    connid: connuuid,
                    name: inventoryresp.data.hostname,
                    type: "websocket",
                    agentType: agenttype
                }
                wsconnections[connuuid].inventory = inventoryresp.data.hostname;
                wsconnections[connuuid].agentType = agenttype;
                if(agenttype == "print") {
                    if(inventoryresp.data.hasOwnProperty('groups')) {
                        params["groups"] = inventoryresp.data.groups;
                    }
                    serverlib.inventory.ping(params, function(err, resp) {
                        if(err) {
                            console.log('failed to register print agent in inventory:' + err);
                        } else {
                            if(config.EMAILNOTIFYTO) {
                                emaillib.sendNotification({
                                    email: config.EMAILNOTIFYTO,
                                    subject: "Agent connect notification from " + config.FQDN + " for " + inventoryresp.data.hostname,
                                    message: inventoryresp.data.hostname + " " + agenttype + " " + "agent added to inventory with version " + inventoryresp.data.agentVersion
                                }, function(err) {
                                    if(err) {
                                        console.log(err);
                                    }
                                });
                            }
                            console.log(inventoryresp.data.hostname + " " + agenttype + " " + "agent added to inventory with version " + inventoryresp.data.agentVersion);
                        }
                    })
                } else if(agenttype == "dhcp") {
                    dhcpinventorylib.ping(params, function(err, resp) {
                        if(err) {
                            console.log('failed to register dhcp agent in inventory:' + err);
                        } else {
                            if(config.EMAILNOTIFYTO) {
                                emaillib.sendNotification({
                                    email: config.EMAILNOTIFYTO,
                                    subject: "Agent connect notification from " + config.FQDN + " for " + inventoryresp.data.hostname,
                                    message: inventoryresp.data.hostname + " " + agenttype + " " + "agent added to inventory with version " + inventoryresp.data.agentVersion
                                }, function(err) {
                                    if(err) {
                                        console.log(err);
                                    }
                                });
                            }
                            console.log(inventoryresp.data.hostname + " " + agenttype + " " + "agent added to inventory with version " + inventoryresp.data.agentVersion);
                        }
                    })
                } else {

                }
            }
        }
    );

    socket.on('close', function(message) {
        //console.log('Searching for pending requests to send error result and terminate...');
        let keys = Object.keys(wsrequests);
        for(let i = 0; i < keys.length; i++) {
            //console.log(wsrequests[keys[i]].socketid + " = " + connuuid);
            if(wsrequests[keys[i]].socketid == connuuid) {
                console.log('Found request from disconnecting agent ' + wsconnections[connuuid].inventory + ' to respond to and terminate');
                clearTimeout(wsrequests[keys[i]].timeout);
                wsrequests[keys[i]].callback("The connection to " + wsconnections[connuuid].inventory + " terminated (" + message + ") before a response was received", false);
                delete wsrequests[keys[i]];
            }
        }
        if(wsconnections[connuuid].inventory) {
            if(wsconnections[connuuid].agentType == "print") {
                let inventoryitem = serverlib.inventory.getServer(wsconnections[connuuid].inventory);
                if(inventoryitem) {
                    //console.log(inventoryitem.connid);
                    //console.log(connuuid);
                    if(inventoryitem.connid == connuuid) {
                        console.log(wsconnections[connuuid].inventory + " " + wsconnections[connuuid].agentType + " " + "agent removed from inventory after disconnect (" + message + ")");
                        //console.log(message2.toString());
                        if(config.EMAILNOTIFYTO) {
                            emaillib.sendNotification({
                                email: config.EMAILNOTIFYTO,
                                subject: "Agent disconnect notification from " + config.FQDN + " for " + wsconnections[connuuid].inventory,
                                message: wsconnections[connuuid].inventory + " " + wsconnections[connuuid].agentType + " " + "agent removed from inventory after disconnect (" + message + ")"
                            }, function(err) {
                                if(err) {
                                    console.log(err);
                                }
                            });
                        }
                        serverlib.inventory.delete({ name: wsconnections[connuuid].inventory });
                    } else {
                        console.log("A websocket disconnected, but " + wsconnections[connuuid].inventory + " was not removed from inventory because it is connected via a different websocket");
                    }
                } else {
                    console.log('The websocket for ' + wsconnections[connuuid].inventory + ' disconnected, but could not be found in the inventory');
                }
            } else if(wsconnections[connuuid].agentType == "dhcp") {
                let inventoryitem = dhcpinventorylib.getServer(wsconnections[connuuid].inventory);
                if(inventoryitem) {
                    //console.log(inventoryitem.connid);
                    //console.log(connuuid);
                    if(inventoryitem.connid == connuuid) {
                        console.log(wsconnections[connuuid].inventory + " " + wsconnections[connuuid].agentType + " " + "agent removed from inventory after disconnect (" + message + ")");
                        //console.log(message2.toString());
                        if(config.EMAILNOTIFYTO) {
                            emaillib.sendNotification({
                                email: config.EMAILNOTIFYTO,
                                subject: "Agent disconnect notification from " + config.FQDN + " for " + wsconnections[connuuid].inventory,
                                message: wsconnections[connuuid].inventory + " " + wsconnections[connuuid].agentType + " " + "agent removed from inventory after disconnect (" + message + ")"
                            }, function(err) {
                                if(err) {
                                    console.log(err);
                                }
                            });
                        }
                        dhcpinventorylib.delete({ name: wsconnections[connuuid].inventory });
                    } else {
                        console.log("A websocket disconnected, but " + wsconnections[connuuid].inventory + " was not removed from inventory because it is connected via a different websocket");
                    }
                } else {
                    console.log('The websocket for ' + wsconnections[connuuid].inventory + ' disconnected, but could not be found in the inventory');
                }
            } else {
                //console.log('Failed to delete:');
                //console.log(wsconnections[connuuid]);
            }
        } else {
            console.log('The websocket connection ' + connuuid + ' disconnected after never responding to inventory.');
            console.log(wsconnections[connuuid]);
        }
        delete wsconnections[connuuid];
    });

    socket.on('message', function(message) {
        //let msg = JSON.parse(message.toString());
        //console.log(msg);
        /*let buff = toArrayBuffer(Buffer.from(message, 'base64'));
        //let text = buff.toString('ascii');
        //console.log(buff);
        zlib.gunzip(buff, (err, buffer) => {
            if(err) {
                console.log(err);
                console.trace();
            } else {*/
                var d = new StringDecoder('utf8');
                //d.write(message);
                let msgstr = d.write(message);
                try {
                    //console.log(message);
                    let msg = JSON.parse(msgstr);
                    if(msg.type=="response") {
                        if(wsrequests.hasOwnProperty(msg.id)) {
                            //console.log(wsrequests[msg.id]);
                            clearTimeout(wsrequests[msg.id].timeout);
                            //console.log(msg);
                            wsrequests[msg.id].callback(false, msg.body);
                            delete wsrequests[msg.id];
                        } else {
                            console.log('Got response with no matching request. Perhaps it timed out?');
                        }
                    } else {
                        console.log(message.toString());
                    }
                } catch(e) {
                    console.log('Failed to parse websocket message:');
                    console.log(msgstr);
                    console.log(e);
                }
            //}
        //});
        /*console.log("message from " + connuuid + ": " + message.toString());
        console.log(request.url);*/

    });

  /*setTimeout(function() {
    console.log('sending second message');
    socket.send(JSON.stringify({
        type: "donotlistprinters",
        filter: "all"
    }));
  }, 5000);

  socket.on('message', function(message) {
    console.log(message.toString());
    console.log(request.url);

    let jsonmsg = JSON.parse(message);

    console.log(jsonmsg);

    socket.send(JSON.stringify({
        type: "donotlistprinters",
        filter: "all"
    }));
  });*/
});

module.exports = {
    sendMessage: function(params, callback) {
        sendMessage(params, function(err, resp) {
            callback(err, resp);
        })
    },
    getConnections: function() {
        return wsconnections;
    }
}