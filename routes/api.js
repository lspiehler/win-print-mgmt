var express = require('express');
var router = express.Router();
const serverapi = require('../api/server');
const server = require('../lib/server');
const service = require('../api/service');
const printerapi = require('../api/printer');
const dhcpapi = require('../api/dhcp');
const config = require('../config');
const auth = require('basic-auth');

function basicAuth(params) {
    //console.log(params);
    //console.log(config);
    if(config.BASICAUTHUSER == params.user && config.BASICAUTHPASS == params.pass) {
      return { id: 1, username: config.BASICAUTHUSER, displayName: 'Local User' };
    } else {
      return false;
    }
  }

router.post('/service/cert/new', ensureAuthenticated, function(req, res, next) {
    res.set('Cache-Control', 'public, max-age=0, no-cache');
    service.replaceCert(req.body, function(err, resp) {
        if(resp.headers) {
            for(let i = 0; i <= resp.headers.length - 1; i++) {
                res.set(resp.headers[i][0], resp.headers[i][1]);
            }
        }
        res.status(resp.status).json(resp.body);
    });
});

function ensureAuthenticated(req, res, next) {
    if(config.BASICAUTH===false && config.MSFTAUTH===false) {
    req.user = {};
    req.user.isAdmin = true;
    return next();
    }
    if (req.isAuthenticated()) {
      if(req.user._json.groups) {
        if(req.user._json.groups.indexOf(config.MSFTADMINGROUPID) >= 0){
            req.user.isAdmin = true;
        }
      } else {
        req.user.isAdmin = true;
      }
      return next();
    }
    if(req.headers.authorization) {
      //console.log(req.headers.authorization);
      let httpuser = auth(req);
      let user = basicAuth({user: httpuser['name'], pass: httpuser['pass']});
      //console.log(user);
      if(user) {
        req.user = user;
        req.user.isAdmin = true;
        return next();
      } else {
        //res.redirect('/login');
        res.status(401).send('Unauthorized');
      }
    } else {
        res.status(401).send('Unauthorized');
    }
  };

router.use(function(req, res, next) {
    //console.log(req.url);
    next();
});

/* GET users listing. */
router.get('/server/:object/:action', ensureAuthenticated, function(req, res, next) {
    res.set('Cache-Control', 'public, max-age=0, no-cache');
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

//allow unauthenticated ping
router.post('/server/inventory/ping', function(req, res, next) {
    res.set('Cache-Control', 'public, max-age=0, no-cache');
    serverapi.inventory.ping(req.body, function(err, resp) {
        if(resp.headers) {
            for(let i = 0; i <= resp.headers.length - 1; i++) {
                res.set(resp.headers[i][0], resp.headers[i][1]);
            }
        }
        res.status(resp.status).json(resp.body);
    });
});

//allow unauthenticated ping
router.post('/dhcp/inventory/ping', function(req, res, next) {
    res.set('Cache-Control', 'public, max-age=0, no-cache');
    dhcpapi.inventory.ping(req.body, function(err, resp) {
        if(resp.headers) {
            for(let i = 0; i <= resp.headers.length - 1; i++) {
                res.set(resp.headers[i][0], resp.headers[i][1]);
            }
        }
        res.status(resp.status).json(resp.body);
    });
});

router.post('/server/:object/:action', ensureAuthenticated, function(req, res, next) {
    res.set('Cache-Control', 'public, max-age=0, no-cache');
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

router.get('/printer/:object/:action', ensureAuthenticated, function(req, res, next) {
    res.set('Cache-Control', 'public, max-age=0, no-cache');
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

router.get('/printer/:object/:action/:server', ensureAuthenticated, function(req, res, next) {
    res.set('Cache-Control', 'public, max-age=0, no-cache');
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

router.post('/debug', function(req, res, next) {
    console.log('debug request');
    printerapi['port']['list']({servers: ['DESKTOP-UF8E9D4']}, function(err, resp) {
        if(err) {
            console.log(err);
        } else {

        }
        res.json(resp);
    });
  });

router.get('/print-servers', ensureAuthenticated, function(req, res) {
    //console.log(req.user);
    server.inventory.list({}, function(err, inventory) {
        if(err) {

        } else {
            res.json(inventory);
        }
    });
});

router.post('/printer/:object/:action', ensureAuthenticated, function(req, res, next) {
    //console.log(printerapi.hasOwnProperty(req.params.object));
    //console.log(printerapi[req.params.object].hasOwnProperty(req.params.action));
    //console.log(req.params.object);
    //console.log(req.params.action);
    //console.log(req.body);
    res.set('Cache-Control', 'public, max-age=0, no-cache');
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

router.post('/dhcp/:object/:action', ensureAuthenticated, function(req, res, next) {
    //console.log(dhcpapi.hasOwnProperty(req.params.object));
    //console.log(dhcpapi[req.params.object].hasOwnProperty(req.params.action));
    //console.log(req.body);
    res.set('Cache-Control', 'public, max-age=0, no-cache');
    if(dhcpapi.hasOwnProperty(req.params.object) && dhcpapi[req.params.object].hasOwnProperty(req.params.action)) {
        dhcpapi[req.params.object][req.params.action](req.body, function(err, resp) {
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
