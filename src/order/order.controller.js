/**
 * Module Dependencies
 */
const service = require('./order.service');
const request = require('request');
const crypto = require('crypto');
const keys = require('../../config/key')

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
        headers: {},
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
            console.log('error: ' + response);
        }
    });
}

function create(req, res, next) {
    console.log(req.body)

    let profit = parseInt(req.body.parent) + parseInt(req.body.profit);
    let losscut = parseInt(req.body.parent) - parseInt(req.body.losscut);
    let number = req.body.number;

    let key = keys.API_KEY;
    let secret = keys.SECRET_API_KEY;
    let timestamp = Date.now().toString();
    let method = 'POST';
    let path = '/v1/me/sendparentorder';
    let body = JSON.stringify({
        "order_method": "IFDOCO",
        "time_in_force": "GTC",
        "parameters": [{
            "product_code": "FX_BTC_JPY",
            "condition_type": "LIMIT",
            "side": "BUY",
            "price": req.body.parent,
            "size": number
        },
        {
            "product_code": "FX_BTC_JPY",
            "condition_type": "LIMIT",
            "side": "SELL",
            "price": profit,
            "size": number
        },
        {
            "product_code": "FX_BTC_JPY",
            "condition_type": "STOP_LIMIT",
            "side": "SELL",
            "price": losscut,
            "trigger_price": losscut,
            "size": number
        }
        ]
    });

    let text = timestamp + method + path + body;
    let sign = crypto.createHmac('sha256', secret).update(text).digest('hex');

    let options = {
        url: 'https://api.bitflyer.jp' + path,
        method: method,
        body: body,
        headers: {
            'ACCESS-KEY': key,
            'ACCESS-TIMESTAMP': timestamp,
            'ACCESS-SIGN': sign,
            'Content-Type': 'application/json'
        }
    };
    request(options, function (err, response, payload) {
        console.log(payload);
    });

    return res.redirect(302, "/");
}

module.exports = controller;