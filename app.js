require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const User = require("./models/user");
const app = express();
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");

app.use(express.json());
app.use(cookieParser());

app.get("/dashboard", auth, async (req, res) => {
  res.send("<h1>Hello World</h1>");
});

app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).json({
        error: "All fields are mandatory",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(401).json({
        error: "Email already exists",
      });
    }

    const myEncPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: email.toLowerCase(),
      password: myEncPassword,
    });

    const token = jwt.sign(
      {
        user_id: user.user_id,
        email,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "2h",
      }
    );
    user.token = token;
    res.status(201).json(user);
  } catch (error) {
    console.log("Something went wrong ::", error);
  }
});

app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      res.status(400).json({
        error: "All fields are mandatory",
      });
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
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

      // res.status(201).json({ email, token });
      const options = {
        expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.status(200).cookie("token", token, options).json({
        success: true,
        token,
      });
    } else {
      res.status(400).json({
        error: "Email or password not matched",
      });
    }
  } catch (error) {
    console.log("Something went wrong :: ", error);
  }
});
module.exports = app;
