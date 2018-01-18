#!/usr/bin/env node
/**
 * TCP server that forwards connections to an `http-mux` WebSocket server.
 * WebSocket framing is added around the connection.
 */
const net = require('net');
const url = require('url');
const args = require('args');
const listen = require('async-listen');
const debug = require('debug')('http-demux');
const websocket = require('websocket-stream');
const { debugStream } = require('./util');

args
  .option('target', 'The target `http-mux` server URL to connect to', 'localhost:3000')
  .option('port', 'The port on which the TCP server will be running', 3001);

const flags = args.parse(process.argv)

async function main({ target, port }) {
  let parsed = url.parse(target);
  if (!parsed.slashes) {
    parsed = url.parse(`http://${target}`);
  }
  parsed.protocol = /s\:$/.test(parsed.protocol) ? 'wss:' : 'ws:';
  const targetWs = url.format(parsed);
  debug('Forwarding connections to %o', targetWs);

  const server = net.createServer(socket => {
    debug('Socket connection');
    socket.on('error', err => debug('socket error %o', err));
    const ws = websocket(targetWs);
    ws.on('error', err => debug('ws error %o', err));
    debug('WebSocket "open" event');
    socket.pipe(ws);
    ws.pipe(socket);
    debugStream(debug, 'ws', ws);
    debugStream(debug, 'socket', socket);
  });
  const addr = await listen(server, port);
  console.log(addr);
}

main(flags).catch(err => {
  console.error(err);
  process.exit(1);
});
