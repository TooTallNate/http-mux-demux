#!/usr/bin/env node
/**
 * HTTP server that forwards HTTP requests to a TCP server of some kind.
 * The HTTP framing is stripped away so that the request body only is
 * sent to the TCP server.
 */

const net = require('net');
const http = require('http');
const listen = require('async-listen');
const debug = require('debug')('http-mux');
const { debugStream } = require('./util');

async function main() {
  const server = http.createServer((req, res) => {
    req.on('error', err => debug('req error %o', err));
    res.on('error', err => debug('res error %o', err));
    if (req.method == 'POST') {
      const socket = net.connect({ port: 6379 });
      socket.on('error', err => debug('socket error %o', err));
      res.writeHead(200);
      debugStream(debug, 'req', req);
      req.pipe(socket);
      debugStream(debug, 'socket', socket);
      socket.pipe(res);
    } else {
      res.statusCode = 404;
      res.end();
    }
  });
  const addr = await listen(server, 3000);
  console.log(addr);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
