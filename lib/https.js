const { http, https} = require('follow-redirects');
const fs = require('fs');

var certs;

var getCerts = function() {
    if(certs) {
        return certs;   
    } else {
        certs = {
            cert: fs.readFileSync(require('path').join(__dirname, '../cert/auth.pem')).toString(),
            key: fs.readFileSync(require('path').join(__dirname, '../cert/auth.key')).toString(),
            ca: fs.readFileSync(require('path').join(__dirname, '../cert/ca.pem')).toString()
        }
        return certs;
    }
}

var httpRequest = function(params, callback) {
    const req = https.request(params.options, res => {
        var resp = [];

        res.on('data', function(data) {
            resp.push(data);
        });

        res.on('end', function() {
            callback(false, {statusCode: res.statusCode, options: params.options, headers: res.headers, body: Buffer.concat(resp).toString()});
        });
    })

    req.on('error', function(err) {
        //console.log(err);
        callback(false, {statusCode: false, options: params.options, headers: false, body: JSON.stringify(err)});
    })

    if(params.options.method=='POST') {
        req.write(JSON.stringify(params.body));
    }

    req.end()
}

module.exports = {
    request: function(params, callback) {
        let mtls = getCerts();
        params.options.cert = mtls.cert;
        params.options.key = mtls.key;
        params.options.ca = mtls.ca;
        //console.log(params);
        httpRequest(params, function(err, resp) {
            if(err) {
                callback(err, resp);
            } else {
                callback(false, resp);
            }
        });
    }
}