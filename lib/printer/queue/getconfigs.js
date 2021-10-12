const https = require('../../https');
const server = require('../../server');

module.exports = function() {
    var responses = [];
    var params;
    var finalcallback;

    var addResponse = function(response) {
        responses.push(response);
        //console.log(response);
        if(responses.length >= params.servers.length) {
            //console.log('response');
            finalcallback(false, responses)
        }
    }
    
    this.query = function(reqparams, callback) {
        params = reqparams;
        console.log(params);
        finalcallback = callback;
        for(let i = 0; i <= params.servers.length - 1; i++) {
            let inventoryobj = server.inventory.exists(params.servers[i]);
            let options = {
                host: params.servers[i],
                port: inventoryobj.port,
                path: '/api/printer/queue/getconfig',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            let body = {
                name: params.name
            }
    
            https.request({ options: options, body: body }, function(err, resp) {
                //console.log(resp.body);
                delete options.cert;
                delete options.key;
                delete options.ca;
                addResponse({ request: options, response: JSON.parse(resp.body) });
            });
        }
        //callback(false, params);
    }
}