/**
 * Module Dependencies
 */
const logger = require('debug')('order:index');
const express = require('express');
const bodyParser = require('body-parser');
const celebrate = require('celebrate');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dbFactory = require('./core/factory/couchdb.factory');
const dbNames = require('./index.db');

/**
 * Creates an Inventory Service application instance
 */
function factory() {
  return new Service();
}

/**
 * The Inventory Service instance
 */
function Service() {
  let options = {
    useCouchDB: false,
  };
  let dbs = {};
  let config = {};
  let server = undefined;
  let app = express();

  // view engine setup
  app.set('views', path.join(__dirname, '../views'));
  app.set('view engine', 'pug');
  app.use(express.static(path.join(__dirname, '../public')));


  let setEnvironment = function (env) {
    logger(`configured for "${env}" mode`);
    this.env = env;
    app.set('env', env);
    return this;
  };

  let bootstrap = function () {
    app = _bootstrap(app);
    return this;
  };

  let useCouchDB = function (cfg) {
    if (cfg === undefined) {
      throw new Error('Cannot use couchdb without configuration');
    }
    options.useCouchDB = true;
    config.couchdb = cfg;
    dbs = _configureCouchDB(cfg, app);
    return this;
  };


  let listen = function (port, ipAddress, onListen) {
    logger('starting express server');

    if (ipAddress === undefined) {
      throw new Error('Cannot start http server without specifying ipAddress');
    }

    if (port === undefined) {
      throw new Error('Cannot start http server without specifying port');
    }

    app = _registerRoute(app);
    app = _errorHandler(app);

    server = app.listen(port, ipAddress, onListen);
    return this;
  };

  let destroy = function () {
    logger('destroying service');

    if (options.useCouchDB && dbs !== undefined) {
      for (var dbname in dbs) {
        let db = dbs[dbname];
        logger(`closing db factory for "${dbname}"`);
        db.close();
      }
    }


    logger('closing express server instance');
    server.close();

    return this;
  };

  return {
    setEnvironment: setEnvironment,
    useCouchDB: useCouchDB,
    bootstrap: bootstrap,
    listen: listen,
    destroy: destroy
  };
}

//////////


/**
 * Bootstrap the express instance
 *
 * @param express
 * @returns express
 */
function _bootstrap(express) {
  logger('registering middlewares');

  if (express.get('env') === 'development') {
    express.use(morgan('dev'));
  }

  express.use(helmet());

  express.use(bodyParser.urlencoded({ extended: true }));
  express.use(bodyParser.json());

  express.use(cors());

  return express;
}

/**
 * Register application routes
 *
 * @param {*} express
 */
function _registerRoute(express) {
  logger('registering application routes');
  require('./index.route.js')(express);
  return express;
}

/**
 * Configures the pouchdb instances
 *
 * @param {*} config
 */
function _configureCouchDB(config, express) {
  let dbs = {};

  // For every models, we will create a pouchdb instance
  dbNames.forEach(dbname => {
    logger(`creating db factory for "${dbname}"`);
    let db = dbFactory(config, dbname);
    dbs[dbname] = db;
  });

  // Export db factory instances to express
  express.set('db', dbs);

  // Add middleware to expose req.app.get('db') to req.db
  express.use((req, res, next) => {
    req.db = req.app.get('db');
    next();
  });

  return dbs;
}



/**
 * Registers express error handlers
 *
 * @param {*} express
 */
function _errorHandler(express) {
  logger('registering error handler middlewares');

  express.use(celebrate.errors());

  // register jwt error handler
  express.use(function (err, req, res, next) {
    if (err) {
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).send();
      }
      if (express.get('env') === 'development') {
        console.error(err);
      }
      return res.status(500).send();
    }

    next();
    return null;
  });

  return express;
}

module.exports = factory;
