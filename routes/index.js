var express = require('express');
var router = express.Router();
const server = require('../lib/server');

/* GET home page. */
router.get('/', function(req, res, next) {
  server.inventory.list({}, function(err, inventory) {
    if(err) {
      res.render('error', { message: err });
    } else {
      res.render('index', { inventory: inventory });
    }
  });
});

router.get('/create-print-queue', function(req, res, next) {
  server.inventory.list({}, function(err, inventory) {
    if(err) {
      res.render('error', { message: err });
    } else {
      res.render('create-print-queue', { inventory: inventory });
    }
  });
});

module.exports = router;
