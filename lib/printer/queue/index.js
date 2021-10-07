const qlist = require('./list');
const qcreate = require('./create');
const qdelete = require('./delete');

module.exports = {
    list: qlist,
    create: qcreate,
    delete: qdelete
}