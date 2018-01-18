#!/usr/bin/env node
/**
 * WebSocket server that forwards connections to an upstream TCP server.
 * The WebSocket framing is stripped away so that the message bodes only
 * are sent to the TCP server.
 */
const net = require('net');
const args = require('args');
const http = require('http');
const listen = require('async-listen');
const debug = require('debug')('http-mux');
const websocket = require('websocket-stream');
const { debugStream } = require('./util');

args
  .option('upstream-host', 'The upstream host to connect to', 'localhost')
  .option('upstream-port', 'The upstream port to connect to', 6379)
  .option(
    'port',
    'The port on which the WebSocket server will be running',
    3000
  );

const flags = args.parse(process.argv);

async function main({ upstreamHost, upstreamPort, port }) {
  debug('Forwarding connections to %o', `${upstreamHost}:${upstreamPort}`);

  const server = http.createServer((req, res) => {
    res.statusCode = 404;
    res.end();
  });
  const wss = websocket.createServer(
    {
      perMessageDeflate: false,
      server
    },
    ws => {
      const socket = net.connect({ host: upstreamHost, port: upstreamPort });
      socket.once('connect', () => debug('socket connected'));
      socket.on('error', err => debug('socket error %o', err));
      socket.pipe(ws);
      ws.pipe(socket);
      debugStream(debug, 'ws', ws);
      debugStream(debug, 'socket', socket);
    }
  );
  const addr = await listen(server, port);
  console.log('http-mux WebSocket server listening at %s', addr);
}

main(flags).catch(err => {
  console.error(err);
  process.exit(1);
});
