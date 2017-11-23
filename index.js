/**
 * Module Dependencies
 */
const service = require('./src');
const events = require('events');
const util = require('util');
const env = process.env.NODE_ENV || 'development';
const couchdbConfig = require('./config/couchdb.config')[env];

function factory() {
  return new Manager;
}

module.exports = factory;

function Manager() {
  let self = this;
  let app = undefined;

  // Default configuration
  let options = {
    ipAddress: '0.0.0.0',
    port: 8997
  };

  // private methods

  /**
   * Start the service instance using the specified port and IP Address
   * 
   * @param {*} port 
   * @param {*} ipAddress 
   */
  let start = function (port, ipAddress) {
    console.log(`booting up in ${env}`);

    if (port !== undefined) {
      options.port = port;
    }

    if (ipAddress !== undefined) {
      options.ipAddress = ipAddress
    }

    // create a new service instance
    app = service()
      .setEnvironment(env)
      .bootstrap()
      .useCouchDB(couchdbConfig)
      .listen(options.port, options.ipAddress, function () {
        self.emit('ready');
      });
  };

  /**
   * Stop the service instance
   */
  let stop = function () {
    if (app !== undefined) {
      app.destroy();
      app = null;
    }

    self.emit('end');
  };

  /**
   * Returns running service base url
   */
  let getBaseUrl = function () {
    let ip = (options.ipAddress === '0.0.0.0') ? '127.0.0.1' : options.ipAddress;
    return 'http://' + ip + ':' + options.port + '/';
  }

  // public methods
  self.start = start;
  self.stop = stop;
  self.getBaseUrl = getBaseUrl;

  return self;
}

util.inherits(Manager, events.EventEmitter);