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

var getSelectedOptions = function(elem, prop) {
    if(!prop) {
        prop = 'value';
    }
    let options = [];
    for(let i = 0; i <= elem.options.length - 1; i++) {
        if(elem.options[i].selected===true) {
            options.push(elem.options[i][prop]);
        }
    }

    return options;
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

    let body = params;
    
    body.combine = true;

    httpRequest({options: options, body: body}, function(err, resp) {
        if(err) {
            callback(err, false);
            return false;
        } else {
            callback(false, resp);
        }
    });
}

var jobManager = function(params) {
    var reqqueue = {};
    var jobqueue = {};
    var respqueue = {};
    var maxqueue = 2;
    var apipath;
    var jobcallback;
    var eventcallback;

    if(params && params.maxqueue >= 1) {
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
        //console.log(reqqueue);
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
                //console.log(job);
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
                        eventcallback({
                            response: resp,
                            request: {
                                options: options,
                                body: body
                            }
                        });
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

var getInputElements = function() {
    var properties = {};

    let elems = ['input', 'select', 'button']
    for(let h = 0; h <= elems.length - 1; h++) {
        let input = document.getElementsByTagName(elems[h]);
        for(let i = 0; i <= input.length - 1; i++) {
            if(input[i].id) {
                if(properties.hasOwnProperty(input[i].id)) {
                    alert('Form contains elements with duplicate IDs');
                } else {
                    properties[input[i].id] = input[i];
                }
            } else {
                //console.log('Found element with no id');
                //console.log(input[i]);
            }
        }
    }

    return properties;
}