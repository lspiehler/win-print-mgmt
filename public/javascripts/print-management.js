function httpRequest(params, callback) {
    var request = new XMLHttpRequest();
    request.open(params.options.method, params.options.path, true);
    if(params.options.headers) {
        let headerkeys = Object.keys(params.options.headers);
        for(let i = 0; i <= headerkeys.length - 1; i++) {
            request.setRequestHeader(headerkeys[i], params.options.headers[headerkeys]);
        }
    }
    
    request.onload = function() {
        if (request.status >= 200 && request.status < 301) {
            // Success!
            var resp = {
                id: params.id,
                statusCode: request.status,
                body: JSON.parse(request.responseText)
            }
            if(resp.body.error) {
                callback(resp.body.error, resp);
            } else if(resp.body.success==false) {
                callback(resp.body.message, resp);
            } else {
                callback(null, resp);
            }
            return;
            //var key = document.getElementById('key');
            //key.innerText = resp.command + '\r\n\r\n' + resp.key;
            //var csroptions = getCSRParams();
            //generateCSR(resp.key, csroptions);
        } else if(request.status == 401) {
            window.location = '/auth/login';
        } else if(request.status >= 400) {
            alert('Invalid response from the server');
        } else {
            // We reached our target server, but it returned an error
            var resp = JSON.parse(request.responseText);
            callback(resp.error, null);
            return;
        }
    };

    request.onerror = function() {
        callback('Communication error', null);
        return;
        // There was a connection error of some sort
    };

    if(params.options.method=='POST') {
        request.send(JSON.stringify(params.body));
    } else {
        request.send();
    }
}

var portJob = function() {
    var queue = [];
    var jobqueue = [];
    var responses = [];
    var jobid = 0;
    var maxqueue = 0;
    var jobcallback;

    this.create = function(params, callback) {
        /*createPorts(params, function(err, resp) {
            if(err) {
                callback(err, false);
            } else {
                callback(false, resp);
            }
        })*/
        jobcallback = callback;
        if(maxqueue == 0) {
            maxqueue = params.servers.length
        }
        fillPortJobQueue(params);
        processJobs();
    }

    var updateQueue = function(id) {
        for(let i = 0; i <= queue.length - 1; i++) {
            if(id == queue[i].id) {
                //console.log('found match ' + i + ' in ' + queue.length + ' item array');
                queue.splice(i, 1);
                break;
            }
        }
        processJobs();
    }

    var processJobs = function(params, callback) {
        //console.log(jobqueue.length);
        //console.log(queue.length);
        if(jobqueue.length > 0) {
            if(queue.length < maxqueue) {
                let job = jobqueue.shift();
                queue.push(job);
                let options = {
                    path: '/api/printer/port/create',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }

                let body = {
                    ip: job.ip,
                    server: job.server
                }
                httpRequest({options: options, body: body, id: job.id}, function(err, resp) {
                    if(err) {
                        callback(err, false);
                        return false;
                    } else {
                        updateQueue(resp.id);
                        responses.push(resp);
                    }
                });
                processJobs(params, callback);
            }
        } else {
            if(queue.length <= 0) {
                jobcallback(false, responses);
            }
        }
    }

    var fillPortJobQueue = function(params) {
        let portindex = 0;
        let serverindex = 0;

        while(portindex <= params.ports.length - 1) {
            while(serverindex <= params.servers.length - 1) {
                let job = {
                    id: jobid,
                    ip: params.ports[portindex],
                    server: params.servers[serverindex]
                }
                jobqueue.push(job);
                jobid++;
                serverindex++;
            }
            serverindex = 0;
            portindex++;
        }

        return jobqueue;
    }

    /*var createPorts = function(params, index, callback) {
        if(index <= params.ports.length - 1) {
            for(let i = 0; i <= params.servers.length - 1; i++) {
                let options = {
                    path: '/api/printer/port/create',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }

                let body = {
                    ip: params.ports[index],
                    server: params.servers[i]
                }

                queue.push({
                    id: uniqueid,
                    server: params.servers[i],
                    port: params.ports[index]
                })
                httpRequest({options: options, body: body, id: uniqueid}, function(err, resp) {
                    if(err) {
                        callback(err, false);
                        return false;
                    } else {
                        updateQueue(resp.id);
                        responses.push(resp);
                    }
                });
                uniqueid++;
            }
            createPorts(params, index + 1, callback);
        } else {
            callback(false, responses);
        }
    }*/
}