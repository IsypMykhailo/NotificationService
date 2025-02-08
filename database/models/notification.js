const { db } = require("../db");
const View = require("../models/view");
const { DataTypes } = require("sequelize");

const Notification = db.define("notification", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    receiverId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    state: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    institutionId: {
        type: DataTypes.BIGINT,
        allowNull: true,
    }
});
Notification.hasMany(View)
View.belongsTo(Notification)
module.exports = Notification