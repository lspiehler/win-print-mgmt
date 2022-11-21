const list = require('./list');
const exists = require('./exists');
const ping = require('./ping');
const del = require('./delete');

module.exports = {
    list: list,
    exists: exists,
    ping: ping,
    delete: del
}