#!/usr/bin/env node
/**
 * TCP server that forwards connections to an `http-mux` server.
 * HTTP framing is added around the connection.
 */

const net = require('net');
const http = require('http');
const https = require('https');
const listen = require('async-listen');
const debug = require('debug')('http-demux');
const { debugStream } = require('./util');

async function main() {
  const server = net.createServer(socket => {
    debug('Socket connection');
    socket.on('error', err => debug('socket error %o', err));
    const req = http.request(
      {
        //const req = https.request({
        //method: 'CONNECT',
        //method: 'POST',
        port: 3000,
        path: '/',
        //port: 443,
        //hostname: 'http-mux-demux-iruplmgrha.now.sh',
        headers: {
          Connection: 'Upgrade',
          Upgrade: 'http-mux'
        }
      },
      res => {
        debug('HTTP response %o', res.statusCode);
        res.on('error', err => debug('res error %o', err));
        res.pipe(socket);
        debugStream(debug, 'res', res);
      }
    );
    req.on('upgrade', (res, upstream, head) => {
      upstream.on('error', err => debug('upstream error %o', err));
      socket.write(head);
      debugStream(debug, 'socket', socket);
      socket.pipe(upstream);
      debugStream(debug, 'upstream', upstream);
      upstream.pipe(socket);
    });
    req.on('error', err => debug('req error %o', err));
    req.setNoDelay(true);
    req.end();
    //socket.pipe(req);
    //debugStream(debug, 'socket', socket);
    //setTimeout(() => req.end(), 1000);
  });
  const addr = await listen(server, 3001);
  console.log(addr);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
