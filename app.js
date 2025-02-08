const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser');
const httpDebug = require('debug')('notifications-service:router');
require("dotenv").config();

const notificationRouter = require('./routes/notifications');
const path = require("path");
const {middlewareAuth} = require("./middlewares/auth");
const {middlewareErrors} = require("./middlewares/errors");

const app = express();

app.use((req, res, next)=> {
    res.on("finish", function() {
        httpDebug(`${req.method} ${decodeURI(req.url)} ${res.statusCode} ${res.statusMessage}`);
    });
    next()
})
app.use(cors({origin: '*'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(middlewareAuth)

app.use('/notifications', notificationRouter);

app.use(middlewareErrors)

module.exports = app;
