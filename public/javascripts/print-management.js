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
        //if (request.status >= 200 && request.status < 301) {
        try {
            var resp = {
                statusCode: request.status,
                body: JSON.parse(request.responseText)
            }
            callback(null, resp);
        } catch(e) {
            var resp = {
                id: params.id,
                options: params.options,
                statusCode: request.status,
                body: request.responseText
            }
            callback(e, resp);
        }
    };

    request.onerror = function(e) {
        callback(e, null);
        return;
        // There was a connection error of some sort
    };

    if(params.options.method=='POST') {
        request.send(JSON.stringify(params.body));
    } else {
        request.send();
    }
}

var getCommonDrivers = function(params, callback) {
    let options = {
        path: '/api/printer/driver/listcommon',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }

    let body = {
        servers: params.servers
    }

    httpRequest({options: options, body: body}, function(err, resp) {
        callback(err, resp);
    });
}

var listPrinters = function(params, callback) {
    let options = {
        path: '/api/printer/queue/list',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }

    let body = {
        servers: [
            "DESKTOP-UF8E9D4"
        ]
    }

    httpRequest({options: options, body: body}, function(err, resp) {
        if(err) {
            callback(err, false);
            return false;
        } else {
            callback(false, resp);
        }
    });
}

var printerJob = function() {
    var queue = [];
    var jobqueue = [];
    var responses = [];
    var jobid = 0;
    var maxqueue = 0;
    var jobcallback;

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

    this.processJobs = function(jobs, e, callback) {
        jobcallback = callback;
        jobqueue = jobs;
        eventcallback = e;
        //console.log(jobqueue);
        processJobs();
    }

    var processJobs = function() {
        //console.log(jobqueue.length);
        //console.log(queue.length);
        if(jobqueue.length > 0) {
            if(queue.length < maxqueue) {
                let job = jobqueue.shift();
                queue.push(job);
                let options = {
                    path: '/api/printer/queue/create',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }

                let body = {
                    id: job.id,
                    server: job.server,
                    name: job.name,
                    driver: job.driver,
                    shared: job.shared,
                    port: job.port,
                    location: job.location,
                    comment: job.comment
                }

                httpRequest({options: options, body: body, id: job.id}, function(err, resp) {
                    //if(err) {
                    //    callback(err, false);
                    //    return false;
                    //} else {
                        updateQueue(resp.id);
                        eventcallback(resp);
                        responses.push(resp);
                    //}
                });
                processJobs();
            }
        } else {
            if(queue.length <= 0) {
                jobcallback(false, responses);
            }
        }
    }

    this.createJobQueue = function(params) {
        //console.log(params);
        let trayindex = 0;
        let serverindex = 0;
        let queue = [];

        maxqueue = params.servers.length;

        for(let i = 0; i <= params.queues.length - 1; i++) {
            //console.log(params.queues[i].name);
            while(trayindex <= params.queues[i].trays.length - 1) {
                while(serverindex <= params.servers.length - 1) {
                    //console.log(params.queues[i].name + '-' + params.queues[i].trays[trayindex] + ' - ' + params.servers[serverindex]);
                    //console.log(params.servers[serverindex]);
                    let name = params.queues[i].name;
                    if(params.queues[i].trays[trayindex] != 0) {
                        name = name + '-T' + params.queues[i].trays[trayindex]
                    }
                    let job = {
                        id: jobid,
                        server: params.servers[serverindex],
                        name: name,
                        driver: params.queues[i].driver,
                        shared: params.queues[i].shared,
                        port: params.queues[i].port,
                        location: params.queues[i].location,
                        comment: params.queues[i].comment
                    }
                    queue.push(job);
                    jobid++;
                    serverindex++;
                }
                serverindex = 0;
                //console.log(params.queues[queueindex]);
                trayindex++;
            }
            trayindex = 0;
        }

        return queue;
    }
}

var jobManager = function(params) {
    var reqqueue = {};
    var jobqueue = {};
    var respqueue = {};
    var maxqueue = 2;
    var apipath;
    var jobcallback;
    var eventcallback;

    if(params.maxqueue >= 1) {
        maxqueue = params.maxqueue;
    }

    this.processJobs = function(req, path, e, callback) {
        jobcallback = callback;
        //jobqueue = jobs;
        apipath = path;
        eventcallback = e;
        for(let i = 0; i <= req.servers.length - 1; i++) {
            reqqueue[req.servers[i]] = [];
            jobqueue[req.servers[i]] = 0;
            respqueue[req.servers[i]] = [];
            for(let j = 0; j <= req.objects.length - 1; j++) {
                //let reqobj = req.objects[j];
                //reqobj.server = req.servers[i];
                let job = {};
                let properties = Object.keys(req.objects[j]);
                for(let k = 0; k <= properties.length - 1; k++) {
                    job[properties[k]] = req.objects[j][properties[k]];
                }
                job.server = req.servers[i];
                reqqueue[req.servers[i]].push(job);
            }
        }
        console.log(reqqueue);
        let reqkeys = Object.keys(reqqueue)
        for(let i = 0; i <= reqkeys.length - 1; i++) {
            //console.log(reqqueue[reqkeys[i]]);
            //console.log(reqkeys[i]);
            processJobs(reqkeys[i]);
        }
    }

    var queueFinished = function(queue) {
        delete jobqueue[queue];
        //console.log(Object.keys(jobqueue).length);
        if(Object.keys(jobqueue).length <= 0) {
            jobcallback(false, respqueue);
        }
    }

    var processJobs = function(queue) {
        //console.log(jobqueue.length);
        //console.log(queue.length);
        if(reqqueue[queue].length > 0) {
            if(jobqueue[queue] < maxqueue) {
                let job = reqqueue[queue].shift();
                console.log(job);
                jobqueue[queue] = jobqueue[queue] + 1;
                let options = {
                    path: apipath,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }

                let body = job;

                httpRequest({options: options, body: body}, function(err, resp) {
                    //if(err) {
                    //    callback(err, false);
                    //    return false;
                    //} else {
                        jobqueue[queue] = jobqueue[queue] - 1;
                        //updateQueue(resp.id);
                        //eventcallback(resp);
                        respqueue[queue].push(resp);
                        processJobs(queue);
                    //}
                });
                processJobs(queue);
            }
        } else {
            if(jobqueue[queue] <= 0) {
                queueFinished(queue);
            }
        }
    }
}

var portJob = function() {
    var queue = [];
    var jobqueue = [];
    var responses = [];
    var jobid = 0;
    var maxqueue = 0;
    var jobcallback;
    var eventcallback;

    /*this.create = function(params, callback) {
        jobcallback = callback;
        if(maxqueue == 0) {
            maxqueue = params.servers.length
        }
        fillJobQueue(params);
        processJobs();
    }*/

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

    this.processJobs = function(jobs, e, callback) {
        jobcallback = callback;
        jobqueue = jobs;
        eventcallback = e;
        //console.log(jobqueue);
        processJobs();
    }

    var processJobs = function() {
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
                    //if(err) {
                    //    callback(err, false);
                    //    return false;
                    //} else {
                        updateQueue(resp.id);
                        eventcallback(resp);
                        responses.push(resp);
                    //}
                });
                processJobs();
            }
        } else {
            if(queue.length <= 0) {
                jobcallback(false, responses);
            }
        }
    }

    this.createJobQueue = function(params) {
        let portindex = 0;
        let serverindex = 0;
        let queue = [];

        maxqueue = params.servers.length;

        while(portindex <= params.ports.length - 1) {
            while(serverindex <= params.servers.length - 1) {
                let job = {
                    id: jobid,
                    ip: params.ports[portindex].ip,
                    server: params.servers[serverindex]
                }
                queue.push(job);
                jobid++;
                serverindex++;
            }
            serverindex = 0;
            portindex++;
        }

        return queue;
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