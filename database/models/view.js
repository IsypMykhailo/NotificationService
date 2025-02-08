const { db } = require("../db");
const { DataTypes } = require("sequelize");

const View = db.define("view", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    viewedBy: {
        type: DataTypes.STRING,
        allowNull: false
    }
});
module.exports = View