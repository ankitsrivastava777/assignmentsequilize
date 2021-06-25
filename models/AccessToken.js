const { Sequelize } = require("sequelize");
const { sequelize } = require("../config/db");
const { user } = require("../models/User");
var AccessToken = sequelize.define(
  "access_token",
  {
    user_id: {
      type: Sequelize.INTEGER,
      refrence: "user",
    },
    access_token: {
      type: Sequelize.STRING,
    },
    expiry: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,   
     },
  },
  {
    freezeTableName: true,
    timestamps : true
  }
);
//  user.hasOne(AccessToken);
//  AccessToken.belongsTo(user);
user.hasOne(AccessToken, {
  foreignKey: 'user_id'
});
AccessToken.belongsTo(user);

exports.AccessToken = AccessToken;
