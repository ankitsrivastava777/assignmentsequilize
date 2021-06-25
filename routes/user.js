var express = require("express");
var app = express();
const bcrypt = require("bcrypt");
var { auth, jwtAuth } = require("../config/auth");
var { user } = require("../models/User");
var { AccessToken } = require("../models/AccessToken");
var { user_address } = require("../models/UserAddress");
const jwt = require("jsonwebtoken");
const path = require("path");
const multer = require("multer");
var cloudinary = require("cloudinary").v2;
const passport = require("passport");
const Mail = require("@sendgrid/mail");

cloudinary.config({
  cloud_name: process.env.CLOUD_API_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
const storage = multer.diskStorage({
  destination: "../upload/images",
  filename: (req, file, callback) => {
    return callback(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: storage,
});

Mail.setApiKey(process.env.SENDGRID_API_KEY);

function generateAccessToken(userId) {
  return jwt.sign(userId, process.env.TOKEN_SECRET, { expiresIn: "600s" });
}

app.post("/register", async (req, res) => {
  const salt = await bcrypt.genSalt();
  const userPassword = await bcrypt.hash(req.body.password, salt);

  if (req.body.password !== req.body.confirmpassword) {
    res.status(500).json({
      error: 1,
      message: "password not matched",
      data: null,
    });
  } else {
    user.sync().then(function () {
      return user.create({
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: userPassword,
        email: req.body.email,
      });
    });
    const msg = {
      to: `${req.body.email}`, // Change to your recipient
      from: "ankit@excellencetechnologies.info", // Change to your verified sender
      subject: "Sending with SendGrid is Fun",
      text: "and easy to do anywhere, even with Node.js",
      html: `<strong>${req.body.username}  has been registered</strong>`,
    };
    Mail.send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });
    res.status(200).json({
      error: 0,
      message: "saved successfully",
      data: null,
    });
  }
});

app.post("/login", passport.authenticate("local"), function (req, res) {
  const token = generateAccessToken({ userId: req.user.id });
  res.status(200).json({
    error: 0,
    message: "user list",
    data: token,
  });
});

app.get("/get", jwtAuth, async function (req, res) {
  user
    .findOne({
      where: { id: req.user.id },
      include: [user_address],
    })
    .then((user) => {
      res.status(200).json({
        error: 0,
        message: "user list",
        data: user,
      });
    });
});

app.put("/delete", jwtAuth, async function (req, res) {
  var user_id = req.user.id;
  console.log(user_id);
  var userDelete = user.destroy({
    where: {
      id: user_id,
    },
  });
  res.status(200).json({
    error: 0,
    message: "user deleted",
    data: null,
  });
});

app.get("/list/:limit/:page", function (req, res) {
  pages_number = Number(req.params.page);
  limit = req.params.limit;
  var skip_user_list = limit * pages_number - pages_number;
  user
    .findAll({
      offset: skip_user_list,
      limit: pages_number,
    })
    .then(function (userData) {
      if (err) {
        res.status(500).json({
          error: 0,
          message: err.message,
          data: null,
        });
      }
      res.status(200).json({
        error: 0,
        message: "user list",
        data: userData,
      });
    });
});

app.post("/address", jwtAuth, async function (req, res) {
  var userId = req.user.id;
  var address = req.body.address;
  var city = req.body.city;
  var state = req.body.state;
  var pin_code = req.body.pin_code;
  var phone_no = req.body.phone_no;
  user_address.sync().then(function () {
    return user_address.create({
      userId: userId,
      address: address,
      city: city,
      state: state,
      pin_code: pin_code,
      phone_no: phone_no,
    });
  });
  res.status(200).json({
    error: 0,
    message: "address saved",
    data: null,
  });
});

app.post("/forgot-password", jwtAuth, async function (req, res) {
  var username = req.body.username;
  user
    .findOne({
      where: { username: username },
    })
    .then(function (userDetails) {
      if (userDetails && userDetails.id) {
        const token = generateAccessToken({ userId: req.user.id });
        AccessToken.sync().then(function () {
          return AccessToken.create({
            user_id: userDetails.id,
            access_token: token,
          });
        });
        const msg = {
          to: `${userDetails.email}`,
          from: "ankit@excellencetechnologies.info",
          subject: "Sending with SendGrid is Fun",
          text: "and easy to do anywhere, even with Node.js",
          html: `<a href="http://localhost:4000/user/verify-reset-password/${token}">Click to Reset Password</a>`,
        };
        Mail.send(msg)
          .then(() => {
            console.log("Email sent");
          })
          .catch((error) => {
            console.error(error);
          });
        res.status(200).json({
          error: 0,
          message: "token saved",
          data: token,
        });
        // });
      } else {
        res.status(500).json({
          error: 1,
          message: "user not found",
          data: null,
        });
      }
    });
});

app.post("/verify-reset-password/:token", async function (req, res, next) {
  var forgetToken = req.params.token;
  if (forgetToken == null)
    return res.status(401).json({
      error: 0,
      message: "invalid token",
      data: null,
    });
  AccessToken.findOne({
    where: { access_token: forgetToken },
  }).then(function (tokenDetail) {
    if (tokenDetail && tokenDetail.id) {
      jwt.verify(forgetToken, process.env.TOKEN_SECRET, (err, verifiedJwt) => {
        if (err) {
          res.status(500).json({
            error: 0,
            message: err.message,
            data: null,
          });
        } else {
          var newPassword = req.body.password;
          const salt = bcrypt.genSalt();
          const userPassword = bcrypt.hash(newPassword, salt);
          var tokenData = AccessToken.findOne({ where: { id: tokenDetail.id } });
          if (tokenData) {
            user.update({
              where: { password: userPassword },
            });
            jwt.destroy(forgetToken);
            res.status(200).json({
              error: 0,
              message: "password reset successfully",
              data: null,
            });
            next();
          }
        }
      });
    } else {
      res.status(500).json({
        error: 1,
        message: "token not matched or expired",
        data: null,
      });
    }
  });
});

app.post(
  "/profile-image",
  upload.single("image"),
  async function (req, res, next) {
    cloudinary.uploader.upload(req.file.path, function (err, result) {
      res.status(200).json({
        error: 0,
        message: "image upload successfully",
        data: result.url,
      });
    });
  }
);

module.exports = app;
