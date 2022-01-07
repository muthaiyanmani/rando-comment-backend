const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization").replace("Bearer ", "");

  if (!token) {
    return res.status(403).json({
      error: "Unauthorized",
    });
  }

  try {
    jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = auth;
