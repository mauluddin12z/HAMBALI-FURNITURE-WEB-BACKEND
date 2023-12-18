import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import mysql2 from "mysql2";
dotenv.config();


const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    timezone: "+07:00",
    dialect: "mysql",
    dialectModule: mysql2,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
});

export default db;