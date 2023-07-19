var express = require('express');
var router = express.Router();
const server = require('../lib/server');
const dhcpinventory = require('../lib/dhcp/inventory');
const passport = require("passport");
const msftconfig = require("../msftconfig");
const config = require('../config');
const auth = require('basic-auth');
const db = require('../db');
const formidable = require('formidable')
const fs = require('fs');
const csv = require('csv-parse');
const sortObject = require('sort-object-keys');

var themes = {
  dark: {
    bodyClass: 'bg-dark text-light',
    navClass: 'navbar-light bg-secondary',
    modalClass: 'bg-dark'
  },
  light: {
    bodyClass: '',
    navClass: 'navbar-dark bg-dark',
    modalClass: 'bg-dark'
  }
}

 const defaulttheme = 'light';

/*router.use(function(req, res, next) {
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
  next();
})*/

/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
  let theme = defaulttheme;
  let dark = false;
  if(config.MSFTAUTH) {
    if(req.user.hasOwnProperty('theme')) {
      theme = req.user['theme']
    }
  }
  if(theme == 'dark') dark = true;
  server.inventory.list({}, function(err, inventory) {
    if(err) {
      res.render('error', { message: err });
    } else {
      res.render('index', { title: 'qManager', inventory: inventory, user: req.user, theme: { class: themes[theme], dark: dark }, config: { msftauth: config.MSFTAUTH, dhcpenabled: config.ENABLEDHCP }});
    }
  });
});

router.get('/template.csv', ensureAuthenticated, function(req, res) {
  res.setHeader('Content-disposition', 'attachment; filename=template.csv');
  res.set('Content-Type', 'text/csv');
  res.status(200).send(`Name,Trays,Driver,Port,Shared,Location,Comment
TempTest01,0,Canon Generic PCL6 Driver,192.168.1.5,FALSE,Test Location,Test Comment
TempTest02,0 1,Canon Generic PCL6 Driver,192.168.1.6,TRUE,Test Location,Test Comment
TempTest03,0 1 2 3,Canon Generic PCL6 Driver,192.168.1.7,FALSE,Test Location,Test Comment
`);
});

router.post('/upload/csv', ensureAuthenticated, function(req, res, next) {
  //console.log(req.headers);
  const form = new formidable.IncomingForm()
  form.multiples = false;
  form.maxFileSize = 50 * 1024 * 1024;
  //console.log(form);
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.log("Error parsing the files");
      return res.status(400).json({
        status: "Fail",
        message: "There was an error parsing the files",
        error: err,
      });
    } else {
      //console.log(fields);
      //console.log(files.file.filepath);
      const results = [];
      let parse = csv.parse({
        auto_parse: true, // Ensures that numeric values remain numeric
        columns: true,
        delimiter: ',',
        trim: true,
        relax: true,
        bom: true
      });
      let uid = 0;
      fs.createReadStream(files.file.filepath)
        .pipe(parse)
        .on('data', function(data) {
          data.Success = 0;
          data.Error = 0;
          data.uid = 'respid-' + uid;
          data.Trays = data.Trays.split(' ');
          data.Tasks = '-';
          uid++; 
          results.push(data)
        })
        .on('end', () => {
          fs.unlink(files.file.filepath, function() {});
          //console.log(results);
          res.json({
            status: 200,
            headers: [],
            body: {
                result: 'success',
                message: false,
                data: results
            }
          });
          // [
          //   { NAME: 'Daffy Duck', AGE: '24' },
          //   { NAME: 'Bugs Bunny', AGE: '22' }
          // ]
        })
        .on('error', (error) => {
          fs.unlink(files.file.filepath, function() {});
          //console.log(error.toString());
          res.json({
            status: 500,
            headers: [],
            body: {
                result: 'error',
                message: error.toString(),
                data: false
            }
          });
        });
    }
  });
});

router.get('/create-print-queue', ensureAuthenticated, function(req, res, next) {
  let theme = defaulttheme;
  let dark = false;
  if(config.MSFTAUTH) {
    if(req.user.hasOwnProperty('theme')) {
      theme = req.user['theme']
    }
  }
  if(theme == 'dark') dark = true;
  server.inventory.list({}, function(err, inventory) {
    if(err) {
      res.render('error', { message: err });
    } else {
      let sorted = [];
      for(let i = 0; i <= inventory.length - 1; i++) {
        sorted.push(inventory[i].name);
      }
      sorted.sort();
      server.inventory.groups({}, function(err, servergroups) {
        if(err) {
          res.render('error', { message: err });
        } else {
          //console.log(groups);
          let groups = sortObject(servergroups);
          res.render('create-print-queue', { title: 'qManager', inventory: sorted, groups: groups, user: req.user, theme: { class: themes[theme], dark: dark }, config: { msftauth: config.MSFTAUTH, dhcpenabled: config.ENABLEDHCP }});
        }
      });
    }
  });
});

router.get('/bulk-create-print-queue', ensureAuthenticated, function(req, res, next) {
  let theme = defaulttheme;
  let dark = false;
  if(config.MSFTAUTH) {
    if(req.user.hasOwnProperty('theme')) {
      theme = req.user['theme']
    }
  }
  if(theme == 'dark') dark = true;
  server.inventory.list({}, function(err, inventory) {
    if(err) {
      res.render('error', { message: err });
    } else {
      let sorted = [];
      for(let i = 0; i <= inventory.length - 1; i++) {
        sorted.push(inventory[i].name);
      }
      sorted.sort();
      server.inventory.groups({}, function(err, servergroups) {
        if(err) {
          res.render('error', { message: err });
        } else {
          //console.log(groups);
          let groups = sortObject(servergroups);
          res.render('bulk-create-print-queue', { title: 'qManager', inventory: sorted, groups: groups, user: req.user, theme: { class: themes[theme], dark: dark }, config: { msftauth: config.MSFTAUTH, dhcpenabled: config.ENABLEDHCP }});
        }
      });
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

router.get('/websocket-test', function(req, res, next) {
  res.render('websocket-test', { layout: false, title: 'qManager' });
});

router.get('/debug', function(req, res, next) {
  res.render('debug', { layout: false, title: 'qManager' });
});

router.get('/manage-queues', ensureAuthenticated, function(req, res, next) {
  let theme = defaulttheme;
  let dark = false;
  if(config.MSFTAUTH) {
    if(req.user.hasOwnProperty('theme')) {
      theme = req.user['theme']
    }
  }
  if(theme == 'dark') dark = true;
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
      server.inventory.groups({}, function(err, servergroups) {
        if(err) {
          res.render('error', { message: err });
        } else {
          //console.log(groups);
          let groups = sortObject(servergroups);
          res.render('manage-queues', { title: 'qManager', inventory: sorted, groups: groups, user: req.user, theme: { class: themes[theme], dark: dark }, config: { msftauth: config.MSFTAUTH, dhcpenabled: config.ENABLEDHCP, deletelimit: config.QUEUEDELETELIMIT, modifylimit: config.QUEUEMODIFYLIMIT }});
        }
      });
    }
  });
});

router.get('/manage-leases', ensureAuthenticated, function(req, res, next) {
  //console.log(req.query)
  let theme = defaulttheme;
  let dark = false;
  if(config.MSFTAUTH) {
    if(req.user.hasOwnProperty('theme')) {
      theme = req.user['theme']
    }
  }
  if(theme == 'dark') dark = true;
  dhcpinventory.list({}, function(err, inventory) {
    if(err) {
      res.render('error', { message: err });
    } else {
      let sorted = [];
      for(let i = 0; i <= inventory.length - 1; i++) {
        sorted.push(inventory[i].name);
      }
      sorted.sort();
      res.render('manage-leases', { title: 'qManager', inventory: sorted, user: req.user, queryparms: JSON.stringify(req.query), theme: { class: themes[theme], dark: dark }, config: { msftauth: config.MSFTAUTH, dhcpenabled: config.ENABLEDHCP, deletelimit: config.DHCPDELETELIMIT, modifylimit: config.DHCPMODIFYLIMIT } });
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
    if(req.user._json.groups) {
      if(req.user._json.groups.indexOf(config.MSFTADMINGROUPID) >= 0){
        req.user.isAdmin = true;
      }
    } else {
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
  if(req.session) {
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
  } else {
    res.redirect('/');
  }
});

router.post('/theme', function(req, res){
  db.users.setDarkMode(req.user.oid, req.body.dark);
  res.json({
    status: 200,
    headers: [],
    body: {
        result: 'success',
        message: 'Dark mode set to ' + JSON.stringify(req.body),
        data: false
    }
  });
});

module.exports = router;
