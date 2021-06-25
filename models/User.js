const { Sequelize } = require("sequelize");
const { sequelize } = require("../config/db");
const { user_address } = require("../models/UserAddress");

var user = sequelize.define(
  "users",
  {
    username: {
      type: Sequelize.STRING,
      field: "username_name",
    },
    lastname: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
      field: "user_email",
    },
    password: {
      type: Sequelize.STRING,
    },
  },
  {
    freezeTableName: true,
  }
);

user.hasOne(user_address);
user_address.belongsTo(user);

exports.user = user;
