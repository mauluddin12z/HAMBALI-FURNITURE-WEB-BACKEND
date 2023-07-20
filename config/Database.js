import {Sequelize} from "sequelize";

const db = new Sequelize('hambali_furniture','root','',{
    host: 'localhost',
    dialect: "mysql"
});

export default db;