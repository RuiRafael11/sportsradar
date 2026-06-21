// Compatibility entrypoint for older scripts/docs.
module.exports = require('./server');

if (require.main === module) {
  module.exports.start();
}
