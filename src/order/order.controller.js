/**
 * Module Dependencies
 */
const service = require('./order.service');
const request = require('request-promise');
const crypto = require('crypto');
const keys = require('../../config/key')
const API_KEY = keys.API_KEY;
const SECRET_KEY = keys.SECRET_API_KEY;

const controller = {
    init: init,
    create: create,
    cancel: cancel
};

var BF_URL = 'https://api.bitflyer.jp'

function init(req, res, next) {
    let price;
    let orders = [];
    _getCurrentPrice()
        .then((resBody) => {
            price = resBody.ltp;
            console.log(price)
            _getOrders()
                .then((resBody) => {
                    for (order of resBody) {
                        orders.push({
                            orderId: order.child_order_id,
                            side: order.side,
                            orderType: order.child_order_type,
                            price: order.price.toLocaleString()
                        })
                    }
                    console.log(orders)
                    return res.render('index', {
                        title: 'order',
                        price: price,
                        orders: orders
                    });
                }).catch((err) => {
                    console.log(err)
                })
        })
        .catch((err) => {
            console.log(err)
            return res.render('index', {
                title: 'order',
                error: err
            })
        });
}

function create(req, res, next) {
    let price = req.body.parent.replace(/,/g, '')
    let profit = parseInt(price) + parseInt(req.body.profit);
    let losscut = parseInt(price) - parseInt(req.body.losscut);
    let number = req.body.number;

    let path = '/v1/me/sendparentorder'
    let method = "POST"
    let body = JSON.stringify({
        "order_method": "IFDOCO",
        "time_in_force": "GTC",
        "parameters": [{
                "product_code": "FX_BTC_JPY",
                "condition_type": "LIMIT",
                "side": "BUY",
                "price": price,
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

    let sign = _getSign(path, body, method)
    let options = {
        url: BF_URL + path,
        method: method,
        body: body,
        headers: {
            'ACCESS-KEY': API_KEY,
            'ACCESS-TIMESTAMP': Date.now().toString(),
            'ACCESS-SIGN': sign,
            'Content-Type': 'application/json'
        }
    };
    request(options, function (err, response, payload) {
        console.log(payload);
    });

    return res.redirect(302, "/");
}

function cancel(req, res, next) {
    console.log("aaa")
    _cancelAll()
        .then((result) => {
            return res.redirect(302, "/");
        })

}

function _getCurrentPrice() {
    const options = {
        url: BF_URL + '/v1/getticker' + '?product_code=FX_BTC_JPY',
        headers: {},
        json: true
    };
    return request.get(options);
}

function _getOrders() {

    let method = 'GET';
    let path = '/v1/me/getchildorders' + '?product_code=FX_BTC_JPY' + '&child_order_state=ACTIVE';
    let timestamp = Date.now().toString();

    let text = timestamp + method + path;
    sign = _getSign(path, "", method)

    let options = {
        url: BF_URL + path,
        method: method,
        json: true,
        headers: {
            'ACCESS-KEY': API_KEY,
            'ACCESS-TIMESTAMP': timestamp,
            'ACCESS-SIGN': sign,
            'Content-Type': 'application/json'
        }
    };
    return request.get(options);
}

function _getSign(path, body, method) {
    let timestamp = Date.now().toString();
    let text = timestamp + method + path + body;
    return crypto.createHmac('sha256', SECRET_KEY).update(text).digest('hex');
}

function _cancelAll() {
    let path = '/v1/me/cancelallchildorders'
    let method = "POST"
    let body = JSON.stringify({
        "product_code": "FX_BTC_JPY"
    });
    let sign = _getSign(path, body, method)
    let options = {
        url: BF_URL + path,
        method: method,
        body: body,
        headers: {
            'ACCESS-KEY': API_KEY,
            'ACCESS-TIMESTAMP': Date.now().toString(),
            'ACCESS-SIGN': sign,
            'Content-Type': 'application/json'
        }
    };
    return request(options);
}

module.exports = controller;