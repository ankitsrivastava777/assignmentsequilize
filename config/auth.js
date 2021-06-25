var { user } = require("../models/User");
var { AccessToken } = require("../models/AccessToken");
const jwt = require("jsonwebtoken");

var jwtAuth = function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (authHeader == null)
    return res.status(500).json({
      error: 1,
      message: "token not matched",
      data: null,
    });
  jwt.verify(authHeader, process.env.TOKEN_SECRET, (err, verifiedJwt) => {
    if (err) {
      res.status(200).json({
        error: 1,
        message: err.message,
        data: null,
      });
    } else {
      console.log(verifiedJwt.userId);

      // user.findOne(
      //   { _id: verifiedJwt.userId },
      //   function (err, userDetails) {
      user
        .findOne({
          where: { id: verifiedJwt.userId },
        })
        .then(function (userDetails) {
          if (userDetails && userDetails.id) {
            req.user = userDetails;
            next();
          } else {
            res.status(500).json({
              error: 1,
              message: "user not found",
              data: null,
            });
          }
        });
    }
  });
};
var auth = async function authenticateToken(req, res, next) {
  var user_id = req.headers.token;
  var userDetails = await AccessToken.findOne({ where: { user_id: user_id } });
  if (userDetails && userDetails.id) {
    req.user = userDetails;
    next();
  } else {
    res.status(500).json({
      message: "user not found",
    });
  }
};

exports.auth = auth;
exports.jwtAuth = jwtAuth;
