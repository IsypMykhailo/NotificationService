const Queue = require('bull');
const AWS = require("aws-sdk")
const Notification = require('../database/models/notification')
const {sendNotification} = require("../socket/socket");
const jobDebug = require('debug')('notifications-service:job')
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

exports.initReceivingJob = async function () {
    const sqsQueue = new Queue('sqs-notifications', { redis: { host: 'redis-server', port: 6379 } });

    AWS.config.update({region: 'eu-central-1'});

    const sqs = new AWS.SQS();
    const queueURL = process.env.SQS_URL;
    const params = {
        QueueUrl: queueURL,
    };

    sqsQueue.process(function (job, done) {
        sqs.receiveMessage(params, async function(err, data) {
            if (err) {
                jobDebug("Receive Error", err);
            }
            else if (data.Messages) {
                jobDebug(data.Messages)

                for (const message of data.Messages) {
                    const body = JSON.parse(message.Body)

                    const notification = await Notification.create({
                        type: body.type,
                        state: body.state,
                        receiverId: body.receiverId,
                        institutionId: body.institutionId
                    })

                    const receiverId = notification.receiverId
                    delete notification.receiverId

                    sendNotification(notification, receiverId, notification.institutionId)

                    const deleteParams = {
                        QueueUrl: queueURL,
                        ReceiptHandle: message.ReceiptHandle
                    };
                    sqs.deleteMessage(deleteParams, function(err, data) {
                        if (err) {
                            jobDebug("Delete Error", err);
                        } else {
                            jobDebug("Message Deleted", data);
                        }
                    });
                }
            }

            done()
        });
    });

    await sqsQueue.add({}, {repeat: {cron: '*/15 * * * * *'}})
}