#!/usr/bin/env node
/**
 * TCP server that forwards connections to an `http-mux` server.
 * HTTP framing is added around the connection.
 */

const net = require('net');
const http = require('http');
const listen = require('async-listen');

async function main() {
  const server = net.createServer(socket => {
    socket.on('error', err => console.log('socket error', err));
    const req = http.request({
      method: 'POST',
      port: 3000
    });
    req.on('error', err => console.log('req error', err));
    req.setNoDelay(true);
    req.once('response', res => {
      res.on('error', err => console.log('res error', err));
      res.pipe(socket);
      res.pipe(process.stdout);
    });
    socket.pipe(req);
    socket.pipe(process.stdout);
  });
  const addr = await listen(server, 3001);
  console.log(addr);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
