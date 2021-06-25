const { Sequelize } = require("sequelize");
const { sequelize } = require("../config/db");

var user_address = sequelize.define(
  "user_address",    {
      address: {
        type: Sequelize.STRING,
      },
      city: {
        type: Sequelize.STRING,
      },
      state: {
        type: Sequelize.STRING,
      },
      pin_code: {
        type: Sequelize.STRING,
      },
      phone_no: {
        type: Sequelize.STRING,
      },
    },
    {
      freezeTableName: true,

    }
  );

  exports.user_address = user_address;