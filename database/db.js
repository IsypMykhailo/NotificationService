const { Sequelize } = require("sequelize");
const dbDebug = require('debug')('notifications-service:database')

require("dotenv").config();

const db = new Sequelize(process.env.POSTGRESQL_DB_URI, {
    logging: msg => dbDebug(msg)
})

const testDbConnection = async () => {
    try {
        await db.authenticate();
        dbDebug("Connection has been established successfully.");
        return true
    } catch (error) {
        dbDebug("Unable to connect to the database:", error);
        return false
    }
};

module.exports = { db, testDbConnection };