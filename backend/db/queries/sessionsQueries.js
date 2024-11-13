function logoutUser(req, res, next) {
  req.logout(function(err) {
    if (err) {
      console.error('Error during logout:', err);
      return next(err);  // Forward the error to the error handler
    }
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        console.error('Error destroying session:', sessionErr);
        return next(sessionErr);
      }
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.status(200).send("Log out success");
    });
  });
}


function loginUser(req, res) {
  req.session.currentUser = req.user;
  req.session.save((err) => {
    if (err) {
      console.error('Error saving session:', err);
      return res.status(500).send("Error logging in");
    }
    // Sending user data along with session details if needed
    res.json({ user: req.user, message: "Login successful" });
  });
}

function isLoggedIn(req, res) {
  if (req.user) {
    res.json(req.user);
  } else {
    res.json({ email: null });
  }
}

module.exports = {
  logoutUser,
  loginUser,
  isLoggedIn
};
