/**
 * Module Dependencies
 */
const PouchDB = require('pouchdb');

/**
 *
 * @param {*} config
 * @param {*} dbName
 */
function factory(config, dbName) {
  return new PouchDB(config.url + '/' + dbName, {
    auth: config.auth
  });
}

module.exports = factory;
