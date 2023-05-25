var createError = require('http-errors');
var express = require('express');
var expressSession = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var methodOverride = require('method-override');
const config = require('./config');
const db = require('./db');

if(config.MSFTAUTH) {
  var passport = require("passport");
}

if(config.MSFTAUTH) {
  var msftconfig = require("./msftconfig");
  var OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

  /*passport.serializeUser(function(user, done) {
    //done(null, user.oid);
    done(null, JSON.stringify(user));
  });

  passport.deserializeUser(function(user, done) {
    //findByOid(oid, function (err, user) {
      done(null, JSON.parse(user));
    //});
  });*/

  passport.serializeUser(function(user, done) {
    done(null, user.oid);
  });

  passport.deserializeUser(function(oid, done) {
    db.users.getUser(oid, function (err, user) {
      done(err, user);
    });
  });

  // array to hold logged in users

  passport.use(new OIDCStrategy({
    identityMetadata: msftconfig.creds.identityMetadata,
    clientID: msftconfig.creds.clientID,
    responseType: msftconfig.creds.responseType,
    responseMode: msftconfig.creds.responseMode,
    redirectUrl: msftconfig.creds.redirectUrl,
    allowHttpForRedirectUrl: msftconfig.creds.allowHttpForRedirectUrl,
    clientSecret: msftconfig.creds.clientSecret,
    validateIssuer: msftconfig.creds.validateIssuer,
    isB2C: msftconfig.creds.isB2C,
    issuer: msftconfig.creds.issuer,
    passReqToCallback: msftconfig.creds.passReqToCallback,
    scope: msftconfig.creds.scope,
    loggingLevel: msftconfig.creds.loggingLevel,
    nonceLifetime: msftconfig.creds.nonceLifetime,
    nonceMaxAmount: msftconfig.creds.nonceMaxAmount,
    useCookieInsteadOfSession: msftconfig.creds.useCookieInsteadOfSession,
    cookieEncryptionKeys: msftconfig.creds.cookieEncryptionKeys,
    clockSkew: msftconfig.creds.clockSkew,
  },
  function(iss, sub, profile, accessToken, refreshToken, done) {
    if (!profile.oid) {
      return done(new Error("No oid found"), null);
    }
    // asynchronous verification, for effect...
    process.nextTick(function () {
      db.users.getUser(profile.oid, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          // "Auto-registration"
          db.users.addUser(profile, function(err, result) {
            return done(null, profile);
          });
        } else {
          return done(null, user);
        }
      });
    });
  }
  ));
}

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.enable('trust proxy', true);

if(config.MSFTAUTH) {
  app.use(methodOverride());
  app.use(expressSession({ secret: config.MSFTSESSIONSECRET, resave: true, saveUninitialized: false }));
  app.use(passport.initialize());
  app.use(passport.session());
}

app.use(logger('common', {
  skip: function(req, res) {
    if(req.url=='/server/inventory/ping' || req.url=='/dhcp/inventory/ping') {
      return true;
    } else {
      return false;
    }
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);
app.use('/js/bootstrap', express.static('./node_modules/bootstrap/dist/js'));
app.use('/js/jquery', express.static('./node_modules/jquery/dist'));
app.use('/js/jquery-easing', express.static('./node_modules/jquery-easing/dist'));
app.use('/js/datatables', express.static('./node_modules/datatables.net/js'));
app.use('/js/datatables-bs5', express.static('./node_modules/datatables.net-bs5/js'));
app.use('/js/datatables-buttons-bs5', express.static('./node_modules/datatables.net-buttons-bs5/js'));
app.use('/js/datatables-buttons', express.static('./node_modules/datatables.net-buttons/js'));
app.use('/js/datatables-select', express.static('./node_modules/datatables.net-select/js'));
app.use('/js/datatables-select-bs5', express.static('./node_modules/datatables.net-select-bs5/js'));
app.use('/js/jquery-datatables-checkboxes', express.static('./node_modules/jquery-datatables-checkboxes/js'));
app.use('/js/dropzone', express.static('./node_modules/dropzone/dist'));
app.use('/css/jquery-datatables-checkboxes', express.static('./node_modules/jquery-datatables-checkboxes/css'));
app.use('/css/datatables-select-bs5', express.static('./node_modules/datatables.net-select-bs5/css'));
app.use('/css/datatables', express.static('./node_modules/datatables.net-dt/css'));
app.use('/css/datatables-bs5', express.static('./node_modules/datatables.net-bs5/css'));
app.use('/css/bootstrap', express.static('./node_modules/bootstrap/dist/css'));
app.use('/css/datatables-buttons-bs5', express.static('./node_modules/datatables.net-buttons-bs5/css'));
app.use('/css/dropzone', express.static('./node_modules/dropzone/dist'));
//app.use('/css/font-awesome', express.static('./node_modules/font-awesome/css'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
