const list = require('./list');
const exists = require('./exists');
const ping = require('./ping');
const del = require('./delete');
const getServer = require('./getServer');

module.exports = {
    list: list,
    exists: exists,
    ping: ping,
    delete: del,
    getServer: getServer
}