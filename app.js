require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const cookie = require("cookie");
const sanitize = require("express-mongo-sanitize");
const cors = require("cors");
const User = require("./models/user");
const Comment = require("./models/comments");
const app = express();
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json()); // JSON parser
app.use(cookieParser()); // Cookie parser

app.use(sanitize()); // To prevent from XSS

//SignUp route
app.post("/signup", async (req, res) => {
  try {
    const { email, password, secretKey } = req.body;

    if (!(email && password && secretKey)) {
      res.status(400).json({
        message: "All fields are mandatory",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(401).json({
        message: "Email already exists",
      });
    }

    //encoding base64
    const round1 = Buffer.from(password).toString("base64");
    //encoding the result of base64
    const myPassword = Buffer.from(round1).toString("base64");

    //hashing secretKey
    const mySecretKey = await bcrypt.hash(secretKey, 10);

    await User.create({
      email: email.toLowerCase(),
      password: myPassword,
      secretKey: mySecretKey,
    });

    res.status(201).json({ message: "registered success" });
  } catch (error) {
    res.status(400).json({
      message: "Couldn't sign up",
    });
  }
});

app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      res.status(400).json({
        message: "All fields are mandatory",
      });
    }

    const user = await User.findOne({ email });

    const round1 = Buffer.from(password).toString("base64");

    if (user && Buffer.from(round1).toString("base64") === user?.password) {
      const token = jwt.sign(
        {
          user_id: user._id,
          email,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: "2h",
        }
      );
      const options = {
        expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
        httpOnly: true,
        path: "/",
      };
      res.setHeader("Set-Cookie", [cookie.serialize("token", token, options)]);
      res.status(200).json({
        message: "signin success",
      });
    } else {
      res.status(400).json({
        message: "Email or password not matched",
      });
    }
  } catch (error) {
    res.status(401).json({
      message: "Coudn't signing in.",
    });
  }
});

app.post("/getPassword", async (req, res) => {
  try {
    const { email, secretKey } = req.body;
    if (!(email && secretKey)) {
      res.status(400).json({
        message: "All fields are mandatory",
      });
    }
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(secretKey, user?.secretKey))) {
      const round1 = Buffer.from(user?.password, "base64").toString("ascii");
      const myPassword = Buffer.from(round1, "base64").toString("ascii");
      res.status(200).json({
        message: myPassword,
      });
    } else {
      res.status(400).json({ message: "Email or secreKey not found" });
    }
  } catch (error) {
    res.status(400).json({ message: "Unable to verify secretKey password" });
  }
});

app.post("/comment", auth, async (req, res) => {
  const { comment } = req.body;
  const { email } = req.user;
  const myComment = new Comment({ comment, email });
  try {
    await myComment.save();
    res.status(200).json({ message: "comment save success" });
  } catch (error) {
    res.status(400).json({ message: "Unable to create a comment" });
  }
});

app.get("/comments", auth, async (req, res) => {
  try {
    const { email } = req.user;
    const data = await Comment.find();
    res.status(200).send({ message: data, email });
  } catch (error) {
    res.status(400).json({ message: "Unable to fetch a comment" });
  }
});
module.exports = app;
