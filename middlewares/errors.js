const {apiResponse} = require("../utils/api");
const httpDebug = require('debug')('notifications-service:router');

exports.middlewareErrors = function (err, req, res, next) {
    httpDebug(err)
    return res.status(500).send(apiResponse(500, null, 'Internal Error'))
}