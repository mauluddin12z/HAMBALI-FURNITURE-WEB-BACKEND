import { Sequelize } from "sequelize";

const db = new Sequelize("hambali_furniture", "root", "", {
  host: "localhost",
  dialect: "mysql",
  timezone: '+07:00'
});

export default db;
