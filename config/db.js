const { Sequelize } = require("sequelize");

var sequelize = new Sequelize("test", "root", "your_secure_password", {
  host: "localhost",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  }
});

exports.sequelize = sequelize;