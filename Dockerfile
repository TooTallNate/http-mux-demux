FROM redis
RUN apt-get update && apt-get install -y curl
RUN curl -Ls install-node.now.sh | sh -s -- --force
RUN npm install -g http-mux-demux
EXPOSE 3000
CMD redis-server & DEBUG=http* http-mux -h localhost -p 6379
