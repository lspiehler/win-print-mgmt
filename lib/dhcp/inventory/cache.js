var cache = {};

module.exports = {
    list: function() {
        return cache;
    },
    addServer: function(server) {
        cache[server.name.toUpperCase()] = server;
        //console.log(cache);
    }
};