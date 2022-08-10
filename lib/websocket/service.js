const express = require('express');
const https = require('https');
const ws = require('ws');
const fs = require('fs');
const config = require('../../config');
const key = fs.readFileSync('./cert/ws.key');
const cert = fs.readFileSync('./cert/ws.pem');
const ca = fs.readFileSync('./cert/wsca.pem');

const app = express();

// Set up a headless websocket server that prints any
// events that come in.
const wsServer = new ws.Server({ noServer: true });

//wsServer.binaryType = 'arrayBuffer';

const options = {
    key: key,
    cert: cert,
    ca: ca,
    requestCert: true,
    rejectUnauthorized: true
}

// `server` is a vanilla Node.js HTTP server, so use
// the same ws upgrade process described here:
// https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
const server = https.createServer(options, app);

app.get('/', (req, res) => { res.send('this is a secure server') });

server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    });
});

server.listen(config.WSLISTENPORT, () => {
    //console.log('listening on 3001')
})

module.exports = wsServer;