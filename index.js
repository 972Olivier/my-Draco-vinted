const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const isAuthenticated = require("./middlewares/isAuthenticated");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(formidable());

mongoose.connect(process.env.MONGODB_URI);
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const user = require("./routers/user");
app.use(user);
const offer = require("./routers/offer");
app.use(offer);

app.all("*", (req, res) => {
  res.status(404).json({
    message: "page not found, bad request",
  });
});

app.listen(process.env.PORT, () => {
  console.log("Server started🚀");
});
