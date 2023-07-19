const list = require('./list');
const groups = require('./groups');
const exists = require('./exists');
const ping = require('./ping');
const del = require('./delete');

module.exports = {
    list: list,
    groups: groups,
    exists: exists,
    ping: ping,
    delete: del
}