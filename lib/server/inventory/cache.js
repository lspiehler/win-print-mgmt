var servers = {};
var groups = {};

module.exports = {
    list: function() {
        return servers;
    },
    groups: function() {
        return groups;
    },
    addServer: function(server) {
        let key = server.name.toUpperCase();
        servers[key] = server;
        if(server.hasOwnProperty("groups")) {
            for(let i = 0; i < server.groups.length; i++) {
                if(groups.hasOwnProperty(server.groups[i])) {
                    if(groups[server.groups[i]].indexOf(server.name) < 0) {
                        console.log("Adding member " + server.name + " to group " + server.groups[i]);
                        groups[server.groups[i]].push(server.name);
                    }
                } else {
                    console.log("Creating group " + server.groups[i] + " and adding member " + server.name);
                    groups[server.groups[i]] = [server.name];
                }
                //console.log(server.name + " is a member of " + server.groups[i]);
            }
        }
        //console.log(servers);
    },
    deleteServer: function(server) {
        if(server.name) {
            let key = server.name.toUpperCase();
            if(servers.hasOwnProperty(key)) {
                if(servers[key].hasOwnProperty('groups')) {
                    if(servers[key]['groups'].length > 0) {
                        for(let i = 0; i < servers[key]['groups'].length; i++) {
                            //console.log(servers[key]['groups'][i]);
                            let member = groups[servers[key]['groups'][i]].indexOf(server.name);
                            //console.log(member);
                            if(member >= 0) {
                                console.log("Removing " + server.name + " membership from " + servers[key]['groups'][i]);
                                groups[servers[key]['groups'][i]].splice(member, 1);
                            }
                            if(groups[servers[key]['groups'][i]].length <= 0) {
                                console.log("Removing group " + servers[key]['groups'][i] + " because the last member has been removed");
                                delete groups[servers[key]['groups'][i]];
                            }
                        }
                    }
                }
                delete servers[key];
            }
            //console.log(server);
        }
        //console.log(servers);
    }
};