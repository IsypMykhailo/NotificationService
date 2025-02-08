const jwt = require("jsonwebtoken");
const socketsDebug = require('debug')('notifications-service:sockets')
const { Server } = require("socket.io");
const { isNullOrWhiteSpace } = require("../utils/validation");
const Notification = require("../database/models/notification");
const View = require("../database/models/view");
const tokenKey = process.env.TOKEN_KEY

let onlineUsers = [];

exports.sendNotification = function (notification, receiverId, institutionId) {
    const users = onlineUsers.filter(e => e.userId === receiverId && (institutionId === null || e.institutionId === institutionId))
    users.map(e => e.socket.emit('new notification', notification))
}

exports.initSocket = function (server) {
    const io = new Server(server, {
        cors: {
            origin: "*",
        },
        allowUpgrades: true
    });

    io.use((socket, next) => {
        if (!socket.handshake.auth.token)
            return next(new Error("Not Authorized"));

        if (!socket.handshake.query.institutionId)
            return next(new Error("Bad Request"));

        socket.institutionId = socket.handshake.query.institutionId
        const token = socket.handshake.auth.token.split(' ')[1]

        jwt.verify(token, Buffer.from(tokenKey, 'base64'), function (err, decoded) {
            if (decoded !== null) {
                socket.userId = decoded.sub
                return next()
            }
            else {
                return next(new Error("Not Authorized"));
            }
        })
    });

    io.on('connection', function(socket) {
        // TODO if userId == null - disconnect socket

        socketsDebug(`CONNECT ${socket.userId} SOCKET ${socket.id}`)

        onlineUsers = [];
        for (let [id, userSocket] of io.of("/").sockets) {
            onlineUsers.push({
                socket: userSocket,
                userId: userSocket.userId,
                institutionId: userSocket.institutionId
            });
        }

        socket.on('view notification', async function (notificationId) {
            if (isNullOrWhiteSpace(notificationId))
                return

            const notification = await Notification.findByPk(notificationId)

            if (notification === null)
                return

            if (notification.receiverId !== socket.userId)
                return

            const view = await View.findOne({
                where: {
                    notificationId: notificationId,
                    viewedBy: socket.userId
                }
            })

            if (view !== null)
                return

            await View.create({
                viewedBy: socket.userId,
                notificationId: notificationId
            })
        })

        socket.on('view all notifications', async function () {
            const notifications = await Notification.findAll({
                where: {
                    receiverId: socket.userId
                },
                include: {
                    model: View,
                    where: {
                        viewedBy: socket.userId
                    },
                    required: false
                },
            });

            const newViews = []
            for (const notification of notifications) {
                if ((notification.views.length === 0))
                    newViews.push({
                        notificationId: notification.id,
                        viewedBy: socket.userId
                    })
            }

            await View.bulkCreate(newViews)
        })

        socket.on('disconnect', function () {
            socketsDebug(`DISCONNECT ${socket.userId} SOCKET ${socket.id}`)

            for(let i = 0; i < onlineUsers.length; i++)
                if (onlineUsers[i].socket.id === socket.id)
                    onlineUsers.splice(i, 1);
        })
    });
}
