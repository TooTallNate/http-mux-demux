# Deploy this `http-mux` WebSocket server which connects to Redis to Now.
# Then locally, run `http-demux -t <NOW_URL> -p 6379`.
# `redis-cli` connects to the Redis server hosted on Now 😏
FROM redis
RUN apt-get update && apt-get install -y curl
RUN curl -Ls install-node.now.sh | sh -s -- --force
RUN npm install -g http-mux-demux
EXPOSE 3000
CMD redis-server & DEBUG=http* http-mux --port 3000 --upstream-port 6379
