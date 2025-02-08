const jwt = require("jsonwebtoken")
const tokenKey = process.env.TOKEN_KEY

exports.middlewareAuth = function (req, res, next) {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1]
        jwt.verify(token, Buffer.from(tokenKey, 'base64'), function (err, decoded) {
            if (decoded !== null)
                req.userId = decoded.sub

            return next()
        })
    }
    else {
        return next()
    }
}