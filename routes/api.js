var express = require('express');
var router = express.Router();
const serverapi = require('../api/server');
const server = require('../lib/server');
const printerapi = require('../api/printer');

router.use(function(req, res, next) {
    //console.log(req.url);
    next();
});

/* GET users listing. */
router.get('/server/:object/:action', function(req, res, next) {
    if(serverapi.hasOwnProperty(req.params.object) && serverapi[req.params.object].hasOwnProperty(req.params.action)) {
        serverapi[req.params.object][req.params.action]({}, function(err, resp) {
            if(resp.headers) {
                for(let i = 0; i <= resp.headers.length - 1; i++) {
                    res.set(resp.headers[i][0], resp.headers[i][1]);
                }
            }
            res.status(resp.status).json(resp.body);
        });
    } else {
        let result = {
            status: 404,
            headers: [],
            body: {
                result: 'error',
                message: 'No route found for ' + req.url,
                data: null
            }
        }
        if(result.headers) {
            for(let i = 0; i <= result.headers.length - 1; i++) {
                res.set(result.headers[i][0], result.headers[i][1]);
            }
        }
        res.status(result.status).json(result.body);
    }
});

router.post('/server/:object/:action', function(req, res, next) {
    if(serverapi.hasOwnProperty(req.params.object) && serverapi[req.params.object].hasOwnProperty(req.params.action)) {
        serverapi[req.params.object][req.params.action](req.body, function(err, resp) {
            if(resp.headers) {
                for(let i = 0; i <= resp.headers.length - 1; i++) {
                    res.set(resp.headers[i][0], resp.headers[i][1]);
                }
            }
            res.status(resp.status).json(resp.body);
        });
    } else {
        let result = {
            status: 404,
            headers: [],
            body: {
                result: 'error',
                message: 'No route found for ' + req.url,
                data: null
            }
        }
        if(result.headers) {
            for(let i = 0; i <= result.headers.length - 1; i++) {
                res.set(result.headers[i][0], result.headers[i][1]);
            }
        }
        res.status(result.status).json(result.body);
    }
});

router.get('/printer/:object/:action', function(req, res, next) {
    if(printerapi.hasOwnProperty(req.params.object) && printerapi[req.params.object].hasOwnProperty(req.params.action)) {
        printerapi[req.params.object][req.params.action]({}, function(err, resp) {
            if(resp.headers) {
                for(let i = 0; i <= resp.headers.length - 1; i++) {
                    res.set(resp.headers[i][0], resp.headers[i][1]);
                }
            }
            res.status(resp.status).json(resp.body);
        });
    } else {
        let result = {
            status: 404,
            headers: [],
            body: {
                result: 'error',
                message: 'No route found for ' + req.url,
                data: null
            }
        }
        if(result.headers) {
            for(let i = 0; i <= result.headers.length - 1; i++) {
                res.set(result.headers[i][0], result.headers[i][1]);
            }
        }
        res.status(result.status).json(result.body);
    }
});

router.get('/printer/:object/:action/:server', function(req, res, next) {
    if(printerapi.hasOwnProperty(req.params.object) && printerapi[req.params.object].hasOwnProperty(req.params.action)) {
        printerapi[req.params.object][req.params.action]({ server: req.params.server }, function(err, resp) {
            if(resp.headers) {
                for(let i = 0; i <= resp.headers.length - 1; i++) {
                    res.set(resp.headers[i][0], resp.headers[i][1]);
                }
            }
            res.status(resp.status).json(resp.body);
        });
    } else {
        let result = {
            status: 404,
            headers: [],
            body: {
                result: 'error',
                message: 'No route found for ' + req.url,
                data: null
            }
        }
        if(result.headers) {
            for(let i = 0; i <= result.headers.length - 1; i++) {
                res.set(result.headers[i][0], result.headers[i][1]);
            }
        }
        res.status(result.status).json(result.body);
    }
});

router.post('/printer/:object/:action', function(req, res, next) {
    //console.log(printerapi.hasOwnProperty(req.params.object));
    //console.log(printerapi[req.params.object].hasOwnProperty(req.params.action));
    //console.log(req.body);
    if(printerapi.hasOwnProperty(req.params.object) && printerapi[req.params.object].hasOwnProperty(req.params.action)) {
        printerapi[req.params.object][req.params.action](req.body, function(err, resp) {
            if(resp.headers) {
                for(let i = 0; i <= resp.headers.length - 1; i++) {
                    res.set(resp.headers[i][0], resp.headers[i][1]);
                }
            }
            res.status(resp.status).json(resp.body);
        });
    } else {
        let result = {
            status: 404,
            headers: [],
            body: {
                result: 'error',
                message: 'No route found for ' + req.url,
                data: null
            }
        }
        if(result.headers) {
            for(let i = 0; i <= result.headers.length - 1; i++) {
                res.set(result.headers[i][0], result.headers[i][1]);
            }
        }
        res.status(result.status).json(result.body);
    }
});

module.exports = router;