/**
 * Module Dependencies
 */
const controller = require('./order.controller');

const route = app => {

  app.get('/order',
    controller.init
  );

  app.post('/order',
    controller.create
  );

};

module.exports = route;
