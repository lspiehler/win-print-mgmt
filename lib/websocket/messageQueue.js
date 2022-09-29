const wsServer = require('./service');
const serverlib = require('../../lib/server');
const config = require('../../config');
const emaillib = require('../email');
const zlib = require("zlib");
var StringDecoder = require('string_decoder').StringDecoder;

const { v4: uuidv4 } = require('uuid');
const { request } = require('express');

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
    }, 10000)
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
                timeout: setTimeout(function() {
                    console.log(new Date());
                    console.log(timeout);
                    console.log(params);
                    callback('websocket timed out waiting for a response', false);
                    delete wsrequests[msguuid];
                }, timeout)
            }
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
                wsconnections[connuuid].inventory = inventoryresp.data.hostname;
                let params = {
                    connid: connuuid,
                    name: inventoryresp.data.hostname,
                    type: "websocket"
                }
                serverlib.inventory.ping(params, function(err, resp) {
                    if(err) {
                        console.log('failed to register agent in inventory:' + err);
                    } else {
                        if(config.EMAILNOTIFYTO) {
                            emaillib.sendNotification({
                                email: "lyas.spiehler@sapphirehealth.org",
                                subject: "Agent connect notification from " + config.FQDN + " for " + inventoryresp.data.hostname,
                                message: inventoryresp.data.hostname + " added to inventory with agent version " + inventoryresp.data.agentVersion
                            }, function(err) {
                                if(err) {
                                    console.log(err);
                                }
                            });
                        }
                        console.log(inventoryresp.data.hostname + " added to inventory with agent version " + inventoryresp.data.agentVersion);
                    }
                })
            }
        }
    );

    socket.on('close', function(message) {
        if(wsconnections[connuuid].inventory) {
            console.log(wsconnections[connuuid].inventory + " removed from inventory after disconnect (" + message + ")");
            //console.log(message2.toString());
            if(config.EMAILNOTIFYTO) {
                emaillib.sendNotification({
                    email: "lyas.spiehler@sapphirehealth.org",
                    subject: "Agent disconnect notification from " + config.FQDN + " for " + wsconnections[connuuid].inventory,
                    message: wsconnections[connuuid].inventory + " removed from inventory after disconnect (" + message + ")"
                }, function(err) {
                    if(err) {
                        console.log(err);
                    }
                });
            }
            serverlib.inventory.delete({ name: wsconnections[connuuid].inventory });
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
                            console.log('got response with no matching request');
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
    }
}