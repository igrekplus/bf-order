/**
 * Module Dependencies
 */
const service = require('./order.service');
const request = require('request');
/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const controller = {
    init: init,
    create: create,
};

function init(req, res, next) {
    // let db = req.db.category;
    const options = {
        url: 'https://api.cryptowat.ch/markets/bitflyer/btcfxjpy/price',
        headers: {
        },
        json: true
    };

    request.get(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let price = body.result.price;
            return res.render('index', {
                title: 'order',
                price: price
            });
        } else {
            console.log('error: ' + response.statusCode);
        }
    });
}

function create(req, res, next) {
    console.log(req.body)
    let body = {

    }
    return res.redirect(302, "/");
}

module.exports = controller;
