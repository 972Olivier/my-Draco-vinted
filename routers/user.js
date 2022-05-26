const express = require("express");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  try {
    const { username, email, password, newsletter } = req.fields;
    // console.log(username, email, password, newsletter);
    if (username && email && password && newsletter) {
      const findUserByName = await User.findOne({ account: { username } });
      const findEmail = await User.findOne({ email: email });
      if (!findUserByName) {
        if (!findEmail) {
          const salt = uid2(16);
          // // console.log(salt);
          const hash = SHA256(password + salt).toString(encBase64);
          // // console.log(hash);
          const token = uid2(16);
          // console.log(token);

          const newUser = new User({
            email: email,
            account: {
              username: username,
              avatar: Object,
            },
            newsletter: newsletter,
            token: token,
            hash: hash,
            salt: salt,
          });
          await newUser.save();
          res.status(200).json({
            _id: newUser._id,
            token: newUser.token,
            account: newUser.account,
          });
        } else {
          res.status(409).json({
            message: "this email This email already has an account",
          });
        }
      } else {
        res.status(400).json({
          message: "This username is already used",
        });
      }
    } else {
      res.status(400).json({ message: "Missing parameters" });
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    // trouver l'utilisateur par son email
    const findEmail = await User.findOne({ email: req.fields.email });
    // console.log(findEmail);
    if (findEmail) {
      // recupérer son salt et générer le hash (User.salt, password)
      const salt = findEmail.salt;
      const password = req.fields.password;
      const newhash = SHA256(password + salt).toString(encBase64);
      // if user.hash === hash // revoie la réponse avec token
      // else if user.hash !== hash // message d'erreur
      if (newhash === findEmail.hash) {
        res.json({
          _id: findEmail._id,
          token: findEmail.token,
          account: findEmail.account,
        });
      } else {
        res.status(400).json({
          message: "Unauthorized",
        });
      }
    } else {
      res.status(400).json({
        message: "Unauthorized",
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

module.exports = router;
