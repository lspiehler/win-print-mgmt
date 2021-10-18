const qlist = require('./list');
const qcreate = require('./create');
const qdelete = require('./delete');
const qgetconfigs = require('./getconfigs');
const qset = require('./set');
const qsetconfig = require('./setconfig');
const qflush = require('./flush');
const qtestpage = require('./testpage');

module.exports = {
    list: qlist,
    create: qcreate,
    delete: qdelete,
    getconfigs: qgetconfigs,
    set: qset,
    setconfig: qsetconfig,
    flush: qflush,
    testpage: qtestpage
}