#!/usr/bin/env node
/**
 * TCP server that forwards connections to an `http-mux` server.
 * HTTP framing is added around the connection.
 */

const net = require('net');
const http = require('http');
const listen = require('async-listen');
const debug = require('debug')('http-demux');
const { debugStream } = require('./util');

async function main() {
  const server = net.createServer(socket => {
    socket.on('error', err => debug('socket error %o', err));
    const req = http.request({
      method: 'POST',
      port: 3000
    });
    req.on('error', err => debug('req error %o', err));
    req.setNoDelay(true);
    req.once('response', res => {
      res.on('error', err => debug('res error %o', err));
      res.pipe(socket);
      debugStream(debug, 'res', res);
    });
    socket.pipe(req);
    debugStream(debug, 'socket', socket);
  });
  const addr = await listen(server, 3001);
  console.log(addr);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
