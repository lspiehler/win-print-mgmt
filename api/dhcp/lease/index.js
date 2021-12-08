const list = require('./list');
const leasedelete = require('./delete');
const reserve = require('./reserve');

module.exports = {
    list: list,
    delete: leasedelete,
    reserve: reserve
}