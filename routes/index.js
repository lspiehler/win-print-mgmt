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
      let sorted = [];
      for(let i = 0; i <= inventory.length - 1; i++) {
        sorted.push(inventory[i].name);
      }
      sorted.sort();
      res.render('create-print-queue', { inventory: sorted });
    }
  });
});

router.get('/manage-queues', function(req, res, next) {
  server.inventory.list({}, function(err, inventory) {
    if(err) {
      res.render('error', { message: err });
    } else {
      let sorted = [];
      for(let i = 0; i <= inventory.length - 1; i++) {
        sorted.push(inventory[i].name);
      }
      sorted.sort();
      res.render('manage-queues', { inventory: sorted });
    }
  });
});

module.exports = router;
