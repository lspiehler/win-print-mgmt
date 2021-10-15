var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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
app.use('/css/jquery-datatables-checkboxes', express.static('./node_modules/jquery-datatables-checkboxes/css'));
app.use('/css/datatables-select-bs5', express.static('./node_modules/datatables.net-select-bs5/css'));
app.use('/css/datatables', express.static('./node_modules/datatables.net-dt/css'));
app.use('/css/datatables-bs5', express.static('./node_modules/datatables.net-bs5/css'));
app.use('/css/bootstrap', express.static('./node_modules/bootstrap/dist/css'));
app.use('/css/datatables-buttons-bs5', express.static('./node_modules/datatables.net-buttons-bs5/css'));
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
