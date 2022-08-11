const https = require('../../https');
const server = require('../../server');
const wsmq = require('../../websocket/messageQueue');

module.exports = function(params, callback) {
    let inventoryobj = server.inventory.exists(params.server)
    if(inventoryobj) {
        let options;
        if(inventoryobj.type=="websocket") {
            options = {
                uuid: inventoryobj.connid,
                timeout: 300000,
                message: {
                    type: 'request',
                    body: {
                        path: '/printer/queue/delete',
                        options: params
                    }
                }
            }
            wsmq.sendMessage(options, function(err, resp) {
                let res = {
                    options: {
                        host: inventoryobj.name
                    },
                    statusCode: 201,
                    body: resp
                }
                callback(false, res);
            });
        } else {
            options = {
                host: params.server,
                port: inventoryobj.port,
                path: '/api/printer/queue/delete',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            https.request({ options: options, body: params }, function(err, resp) {
                if(err) {
                    callback(err, false);
                } else {
                    resp.body = JSON.parse(resp.body);
                    callback(false, resp);
                }
            });
        }
    } else {
        callback(params.server + ' is not a managed print server', false);
    }
}

/*module.exports = function() {
    var responses = [];
    var params;
    var finalcallback;

    var addResponse = function(response) {
        responses.push(response);
        //console.log(response);
        if(responses.length >= params.servers.length) {
            processResponses();
        }
    }
    
    this.submit = function(reqparams, callback) {
        params = reqparams;
        //console.log(servers);
        finalcallback = callback;
        for(let i = 0; i <= params.servers.length - 1; i++) {
            let inventoryobj = server.inventory.exists(params.servers[i]);
            let options = {
                host: params.servers[i],
                port: inventoryobj.port,
                path: '/api/printer/queue/delete',
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
}*/