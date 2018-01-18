#!/usr/bin/env node
/**
 * TCP server that forwards connections to an `http-mux` server.
 * HTTP framing is added around the connection.
 */

const net = require('net');
const listen = require('async-listen');
const debug = require('debug')('http-demux');
const websocket = require('websocket-stream');
const { debugStream } = require('./util');

async function main() {
  const server = net.createServer(socket => {
    debug('Socket connection');
    socket.on('error', err => debug('socket error %o', err));
    const ws = websocket('ws://localhost:3000');
    ws.on('error', err => debug('ws error %o', err));
    debug('WebSocket "open" event');
    socket.pipe(ws);
    ws.pipe(socket);
    debugStream(debug, 'ws', ws);
    debugStream(debug, 'socket', socket);
  });
  const addr = await listen(server, 3001);
  console.log(addr);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
