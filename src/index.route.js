/**
 * Module Dependencies
 */
const logger = require('debug')('order:index:route');
const walk = require('klaw-sync');
const path = require('path');

module.exports = app => {
  walk(__dirname, {
    filter: item => item.path.indexOf('.route.js') > 0
      && path.basename(item.path) !== 'index.route.js'
  }).forEach(item => {
    logger(`register ${path.basename(item.path)}`);

    require(item.path)(app);
  });
};

