import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import mysql2 from "mysql2";
dotenv.config();


const db = new Sequelize("hambali_furniture", "admin", "uzAfVMXg", {
  host: "mysql-158232-0.cloudclusters.net",
  port: 16800,
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