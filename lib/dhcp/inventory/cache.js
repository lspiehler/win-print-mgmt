var cache = {};

module.exports = {
    list: function() {
        return cache;
    },
    addServer: function(server) {
        cache[server.name.toUpperCase()] = server;
        //console.log(cache);
    },
    deleteServer: function(server) {
        if(server.name) {
            delete cache[server.name.toUpperCase()];
        }
        //console.log(cache);
    },
    getServer: function(name) {
        name = name.toUpperCase();
        if(cache.hasOwnProperty(name)) {
            return cache[name];
        } else {
            return null;
        }
    }
};