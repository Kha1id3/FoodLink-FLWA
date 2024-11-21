var express = require("express");
var router = express.Router();
const passport = require("../auth/local");
const { loginRequired } = require("../auth/helpers");
const { loginUser, isLoggedIn, logoutUser } = require("../db/queries/sessionsQueries.js");

// Custom login handler to catch authentication errors
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Error during authentication:", err);
      return res.status(500).json({ message: "An internal server error occurred." });
    }
    if (!user) {
      // Authentication failed (invalid email/password)
      return res.status(401).json({ message: info.message || "Invalid email or password." });
    }
    // Successful login
    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error("Error during login:", loginErr);
        return res.status(500).json({ message: "Error logging in." });
      }
      return loginUser(req, res);
    });
  })(req, res, next);
});

router.get("/isLoggedIn", isLoggedIn);
router.post("/logout", loginRequired, logoutUser);

module.exports = router;
