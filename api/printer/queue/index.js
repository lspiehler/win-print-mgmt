const qlist = require('./list');
const qcreate = require('./create');
const qdelete = require('./delete');
const qgetconfigs = require('./getconfigs');

module.exports = {
    list: qlist,
    create: qcreate,
    delete: qdelete,
    getconfigs: qgetconfigs
}