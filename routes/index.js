var express = require('express');
var router = express.Router();
const server = require('../lib/server');
const passport = require("passport");
const msftconfig = require("../msftconfig");
const config = require('../config');
const auth = require('basic-auth');
const db = require('../db');

/*router.use(function(req, res, next) {
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
  next();
})*/

/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
  //console.log(req.user);
  server.inventory.list({}, function(err, inventory) {
    if(err) {
      res.render('error', { message: err });
    } else {
      res.render('index', { title: 'qManager', inventory: inventory, user: req.user });
    }
  });
});

router.get('/create-print-queue', ensureAuthenticated, function(req, res, next) {
  server.inventory.list({}, function(err, inventory) {
    if(err) {
      res.render('error', { message: err });
    } else {
      let sorted = [];
      for(let i = 0; i <= inventory.length - 1; i++) {
        sorted.push(inventory[i].name);
      }
      sorted.sort();
      res.render('create-print-queue', { title: 'qManager', inventory: sorted, user: req.user });
    }
  });
});

router.get('/auth', ensureAuthenticated, function(req, res, next) {
    //console.log(req.isAuthenticated());
    //console.log(req.user);
    //res.json({ username: req.user.username, email: req.user.emails[0].value });
    //console.log(req.headers.authorization);
    res.redirect('/');
});

router.get('/manage-queues', ensureAuthenticated, function(req, res, next) {
  //console.log(req.url)
  server.inventory.list({}, function(err, inventory) {
    if(err) {
      res.render('error', { message: err });
    } else {
      let sorted = [];
      for(let i = 0; i <= inventory.length - 1; i++) {
        sorted.push(inventory[i].name);
      }
      sorted.sort();
      res.render('manage-queues', { title: 'qManager', inventory: sorted, user: req.user });
    }
  });
});

function basicAuth(params) {
  //console.log(params);
  //console.log(config);
  if(config.BASICAUTHUSER == params.user && config.BASICAUTHPASS == params.pass) {
    return { id: 1, username: config.BASICAUTHUSER, displayName: 'Local User' };
  } else {
    return false;
  }
}

function ensureAuthenticated(req, res, next) {
  //auth if no authentication methods are enabled
  if(config.BASICAUTH===false && config.MSFTAUTH===false) {
    req.user = {};
    req.user.isAdmin = true;
    return next();
  }
  if(config.MSFTAUTH && req.isAuthenticated()) {
    if(req.user._json.groups.indexOf(config.MSFTADMINGROUPID) >= 0){
      req.user.isAdmin = true;
    }
    //console.log(req.user);
    return next();
  }
  if(config.BASICAUTH) {
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
        //res.redirect('/login?redirect_path=' + req.url);
        res.setHeader('WWW-Authenticate', 'Basic realm="Node"')
        res.status(401).send('Unauthorized');
        return;
      }
    } else {
      if(req.url == '/auth') {
        res.setHeader('WWW-Authenticate', 'Basic realm="Node"')
        res.status(401).send('Unauthorized');
        return;
      } else {
        if(config.MSFTAUTH) {
          res.redirect('/login?redirect_path=' + req.url);
        } else {
          res.setHeader('WWW-Authenticate', 'Basic realm="Node"')
          res.status(401).send('Unauthorized');
          return;
        }
      }
    }
  } else {
    if(config.MSFTAUTH) {
      res.redirect('/login?redirect_path=' + req.url);
    } else {
        res.status(401).send('Unauthorized');
        return;
    }
  }
};

// '/account' is only available to logged in user
router.get('/account', ensureAuthenticated, function(req, res) {
  //console.log(req.user);
  res.json({ user: req.user });
});

router.get('/login',
  function(req, res, next) {
    //console.log(req.headers)
    passport.authenticate('azuread-openidconnect', 
      { 
        response: res,                      // required
        resourceURL: msftconfig.resourceURL,    // optional. Provide a value if you want to specify the resource.
        customState: req.query.redirect_path,            // optional. Provide a value if you want to provide custom state value.
        failureRedirect: '/test' 
      }
    )(req, res, next);
  },
  function(req, res) {
    res.redirect('/');
});

// 'GET returnURL'
// `passport.authenticate` will try to authenticate the content returned in
// query (such as authorization code). If authentication fails, user will be
// redirected to '/' (home page); otherwise, it passes to the next middleware.
router.get('/auth/openid/return',
  function(req, res, next) {
    passport.authenticate('azuread-openidconnect', 
      { 
        response: res,    // required
        failureRedirect: '/'  
      }
    )(req, res, next);
  },
  function(req, res) {
    //console.log('We received a return from AzureAD.');
    res.redirect('/');
  });

// 'POST returnURL'
// `passport.authenticate` will try to authenticate the content returned in
// body (such as authorization code). If authentication fails, user will be
// redirected to '/' (home page); otherwise, it passes to the next middleware.
router.post('/auth/openid/return',
  function(req, res, next) {
    passport.authenticate('azuread-openidconnect', 
      { 
        response: res,    // required
        failureRedirect: '/'  
      }
    )(req, res, next);
  },
  function(req, res) {
    //console.log('We received a return from AzureAD.');
    //console.log('here');
    //console.log(req.body);
    let redirect_path = '/';
    if(req.body.state) {
      redirect_path = req.body.state;
    }
    res.redirect(redirect_path);
  });

// 'logout' route, logout from passport, and destroy the session with AAD.
router.get('/logout', function(req, res){
  if(req.user) {
    db.users.deleteUser(req.user.oid, function() {});
  }
  req.session.destroy(function(err) {
    req.logOut();
    //res.redirect(msftconfig.destroySessionUrl);
    if(req.headers.authorization) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Node"');
      res.status(401).render('logout', { layout: null });
    } else {
      res.render('logout', { layout: null });
    }
  });
});

module.exports = router;
