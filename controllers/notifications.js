const Notification = require('../database/models/notification')
const View = require('../database/models/view')
const { Op } = require("sequelize");
const { apiResponse } = require("../utils/api");
const {isNullOrWhiteSpace} = require("../utils/validation");

exports.getNotifications = async function (req, res, next) {
    try {
        if (!req.userId)
            return res.status(401).json(apiResponse(401, null, "Not authorized"))

        if (isNullOrWhiteSpace(req.params.institutionId))
            return res.status(400).json(apiResponse(400, { key: "InstitutionId", errors: [ "Must be not empty or whitespace" ] }))

        let notifications = await Notification.findAll({
            where: {
                [Op.or]: [
                    { receiverId: req.userId },
                    { receiverId: '*' }
                ],
                institutionId: req.params.institutionId
            },
            include: {
                model: View,
                where: {
                    viewedBy: req.userId
                },
                required: false
            },
            order: [
                ['createdAt', 'DESC'],
            ]
        })

        for (let i = 0; i < notifications.length; i++) {
            notifications[i].dataValues.viewed = notifications[i].dataValues.views.length > 0;
            delete notifications[i].dataValues.views
            delete notifications[i].dataValues.receiverId
        }

        return res.status(200).json(apiResponse(200, notifications))
    }
    catch (err) {
        next(err)
    }
}

/*
exports.viewNotification = async function(req, res, next) {
    try {
        if (!req.userId)
            return res.status(401).json(apiResponse(401, null, "Not authorized"))

        if (isNullOrWhiteSpace(req.params.notificationId))
            return res.status(400).json(apiResponse(400, { key: "NotificationId", errors: [ "Must be not empty or whitespace" ] }))

        const notificationId = req.params.notificationId
        const notification = await Notification.findByPk(notificationId)

        if (notification === null)
            return res.status(404).json(apiResponse(404, null, `Notification by id ${notificationId} is not found`))

        if (notification.receiverId !== req.userId)
            return res.status(403).json(apiResponse(403, null, "Forbidden"))

        const view = await View.findOne({
            where: {
                notificationId: notificationId,
                viewedBy: req.userId
            }
        })

        if (view !== null)
            return res.status(400).json(apiResponse(400, { key: "NotificationId", errors: [ "Already viewed by you" ] }))

        await View.create({
            viewedBy: req.userId,
            notificationId: notificationId
        })
        return res.status(201).json(apiResponse(201, null))
    }
    catch (err) {
        next(err)
    }

}*/
