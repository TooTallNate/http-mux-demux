#!/usr/bin/env node
/**
 * HTTP server that forwards HTTP requests to a TCP server of some kind.
 * The HTTP framing is stripped away so that the request body only is
 * sent to the TCP server.
 */

const net = require('net');
const http = require('http');
const listen = require('async-listen');

async function main() {
  const server = http.createServer((req, res) => {
    //req.setNoDelay(true);
    req.on('error', err => console.log('req error', err));
    res.on('error', err => console.log('res error', err));
    if (req.method == 'POST') {
      console.log(req);
      const socket = net.connect({ port: 6379 });
      socket.on('error', err => console.log('socket error', err));
      res.writeHead(200);
      req.pipe(socket);
      req.pipe(process.stdout);
      socket.pipe(res);
      socket.pipe(process.stdout);
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
