const jwt = require("jsonwebtoken");

// Middleware function to determine if the API endpoint request is from an authenticated user
function isAuth(req, res, next) {
  // Get token from headers
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ success: false, error: "No JWT token provided" });
  }

  try {
    // Verify the token and get decoded data
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = decodedToken;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Invalid JWT token" });
  }
}

module.exports = isAuth;
