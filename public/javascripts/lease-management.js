var dhcpmgmt = function(params) {
    var complete = false;
    var log = ['Waiting for DHCP lease search to complete...']
    var progresscallback;
    var completedcallback;
    var leases = [];

    this.complete = function() {
        //console.log('called');
        return complete;
    }

    this.monitorProgress = function(pcallback, ccallback) {
        progresscallback = pcallback;
        completedcallback = ccallback;
    }

    this.log = function() {
        return log;
    }

    this.getLeases = function() {
        if(complete) {
            let ips = {};
            for(let i = 0; i <= leases.length - 1; i++) {
                ips[leases[i].IPAddress] = leases[i];
            }
            return ips;
        } else {
            return false;
        }
    }

    var reserveLease = function(params, callback) {
        //complete = 'searching';
        let options = {
            path: '/api/dhcp/lease/reserve',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    
        let body = {
            "server": params.Servers[0],
            "clientid": params.ClientId,
            "scopeid": params.ScopeId[0]
        }
    
        httpRequest({options: options, body: body}, function(err, resp) {
            if(err) {
                callback(err, false);
            } else {
                callback(false, resp);
            }
        });
    }

    var searchStale = function(params, callback) {
        //complete = 'searching';
        let options = {
            path: '/api/dhcp/lease/list',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    
        let body = {
            "servers": "all",
            "combine": false,
            "search": {
                "comparison": "AND",
                "properties": {
                    "ClientId": [params.ClientId]
                }
            },
            "updatecache": false
        }
    
        httpRequest({options: options, body: body}, function(err, resp) {
            if(err) {
                callback(err, false);
            } else {
                callback(false, resp);
            }
        });
    }

    var takeAction = function(params, callback) {
        var completions = 0;
        var reqcomp = 2;
        var warnings = [];
        //completions++;
        reserveLease(params, function(err, resp) {
            if(err) {
                let msg = 'Converting lease to reservation failed: ' + err;
                log.push(msg);
                if(progresscallback) {
                    progresscallback(msg);
                }
            } else {
                let msg = 'Lease successfully converted to reservation';
                log.push(msg);
                if(progresscallback) {
                    progresscallback(msg);
                }
            }
            completions++;
            if(completions>=reqcomp) {
                //if(completedcallback) {
                    callback(false, warnings);
                    return;
                //}
            }
        });
        searchStale(params, function(err, resp) {
            if(err) {
                let msg = 'Search for stale reservations failed: ' + err;
                log.push(msg);
                if(progresscallback) {
                    progresscallback(msg);
                }
            } else {
                let servers = [];
                let reservations = [];
                for (let i = 0; i < resp.body.data.length; i++) {
                    //console.log(resp.body.data[i].IPAddress[0]);
                    //console.log(params.IPAddress[0]);
                    //console.log(resp.body.data[i].AddressState);
                    if(resp.body.data[i].IPAddress[0] != params.IPAddress[0] && resp.body.data[i].AddressState[0].indexOf('eservation') >= 0) {
                        servers.push(resp.body.data[i].Servers[0]);
                        reservations.push(resp.body.data[i]);
                    }
                }
                if(servers.length <= 0) {
                    servers.push('all');
                }
                let msg = ['DHCP stale lease search for ' + params.ClientId + ' returned ' + reservations.length + ' <a target="_blank" href="/manage-leases?servers=' + servers.join(',') + '&property=ClientId&dedupe=false&value=' + params.ClientId + '">result(s)</a>']
                if(reservations.length > 0) {
                    warnings.push('Please review the discovered stale leases and consider deleting them!');
                }
                log = [msg];
                if(progresscallback) {
                    progresscallback(msg);
                }
            }
            completions++;
            if(completions>=reqcomp) {
                //if(completedcallback) {
                    callback(false, warnings);
                    return;
                //}
            }
        });
    }

    this.searchBulk = function(params) {
        //complete = 'searching';
        let options = {
            path: '/api/dhcp/lease/list',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    
        let body = {
            "servers": "all",
            "combine": true,
            "exactMatch": true,
            "index": "IPAddress",
            "search": {
                "comparison": "AND",
                "properties": {
                    "IPAddress": params.ports
                }
            },
            "updatecache": true
        }
    
        httpRequest({options: options, body: body}, function(err, resp) {
            if(err) {
                complete = true;
                log = ['DHCP lease search for bulk leases failed: ' + err]
                if(completedcallback) {
                    completedcallback(err, log);
                    return;
                }
            } else {
                complete = true;
                leases = resp.body.data
                log = ['DHCP lease search for bulk leases completed']
                if(completedcallback) {
                    completedcallback(err, log);
                    return;
                }
            }
        });
    }

    this.search = function(params) {
        //complete = 'searching';
        let options = {
            path: '/api/dhcp/lease/list',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    
        let body = {
            "servers": "all",
            "combine": false,
            "exactMatch": true,
            "index": "ClientId",
            "search": {
                "comparison": "AND",
                "properties": {
                    "IPAddress": [params.ip]
                }
            },
            "updatecache": true
        }
    
        httpRequest({options: options, body: body}, function(err, resp) {
            if(err) {
                complete = true;
                log = ['DHCP lease search for ' + params.ip + ' failed: ' + err]
                if(completedcallback) {
                    completedcallback(err, log);
                    return;
                }
            } else {
                let servers = [];
                //console.log(resp.body.data);
                for (let i = 0; i < resp.body.data.length; i++) {
                    servers.push(resp.body.data[i].Servers[0]);
                    leases.push(resp.body.data[i]);
                }
                if(servers.length <= 0) {
                    servers.push('all');
                }
                let msg = ['DHCP lease search for ' + params.ip + ' returned ' + resp.body.data.length + ' <a target="_blank" href="/manage-leases?servers=' + servers.join(',') + '&property=IPAddress&dedupe=false&value=%22' + params.ip + '%22">result(s)</a>']
                log = [msg];
                results = resp.body.data;
                if(progresscallback) {
                    progresscallback(msg);
                }
                if(resp.body.data.length == 0) {
                    complete = true;
                    let msg = 'No leases were found to convert to reservations. Further development may add the ability to create reservations from scratch in the future.';
                    log.push(msg);
                    if(progresscallback) {
                        progresscallback(msg);
                    }
                    if(completedcallback) {
                        completedcallback(false, log);
                        return;
                    }
                } else if(resp.body.data.length == 1) {
                    if(resp.body.data[0].AddressState[0].indexOf('eservation') < 0) {
                        if(progresscallback) {
                            progresscallback('Converting lease to reservation and searching for stale reservations...');
                        }
                        takeAction(resp.body.data[0], function(err, warnings) {
                            complete = true;
                            if(err) {
                                if(completedcallback) {
                                    completedcallback(err, log);
                                    return;
                                }
                            } else {
                                if(completedcallback) {
                                    completedcallback(false, log);
                                    return;
                                }
                            }
                            if(warnings.length > 0) {
                                alert(warnings.join('\r\n\r\n'));
                            }
                        });
                        //convert lease
                    } else {
                        complete = true;
                        let msg = 'A reservation for the lease already exists. Please make sure ' + resp.body.data[0].ClientId + ' matches the printer\'s MAC address';
                        log.push(msg);
                        if(progresscallback) {
                            progresscallback(msg);
                        }
                        msg = 'Searching for stale reservations...';
                        log.push(msg);
                        if(progresscallback) {
                            progresscallback(msg);
                        }
                        searchStale(resp.body.data[0], function(err, reserv) {
                            if(err) {
                                let msg = 'Search for stale reservations failed: ' + err;
                                log.push(msg);
                                if(progresscallback) {
                                    progresscallback(msg);
                                }
                            } else {
                                let servers = [];
                                let reservations = [];
                                for (let i = 0; i < reserv.body.length; i++) {
                                    //console.log(resp.body.data[i].IPAddress[0]);
                                    //console.log(params.IPAddress[0]);
                                    //console.log(resp.body.data[i].AddressState);
                                    if(reserv.body[i].IPAddress[0] != resp.body.data[0].IPAddress[0] && reserv.body[i].AddressState[0].indexOf('eservation') >= 0) {
                                        servers.push(reserv.body[i].Servers[0]);
                                        reservations.push(reserv.body[i]);
                                    }
                                }
                                if(servers.length <= 0) {
                                    servers.push('all');
                                }
                                let msg = ['DHCP stale lease search for ' + resp.body.data[0].ClientId + ' returned ' + reservations.length + ' <a target="_blank" href="/manage-leases?servers=' + servers.join(',') + '&property=ClientId&dedupe=false&value=' + resp.body.data[0].ClientId + '">result(s)</a>']
                                if(reservations.length > 0) {
                                    alert('Please review the discovered stale leases and consider deleting them!');
                                }
                                log = [msg];
                                if(progresscallback) {
                                    progresscallback(msg);
                                }
                            }
                            if(completedcallback) {
                                completedcallback(false, log);
                                return;
                            }
                        });
                    }
                } else {
                    complete = true;
                    let msg = 'No leases will be reserved because more than one was found';
                    log.push(msg);
                    if(progresscallback) {
                        progresscallback(msg);
                    }
                    if(completedcallback) {
                        completedcallback(false, log);
                        return;
                    }
                }
                //callback(false, resp.body.data);
            }
        });
    }
}