const split = require('split2');

module.exports = {
  debugStream
};

function debugStream(debug, name, stream) {
  stream.pipe(split()).on('data', line => {
    debug('%s: %s', name, line);
  });
}
