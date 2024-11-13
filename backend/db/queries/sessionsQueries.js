function logoutUser(req, res, next) {
  req.logout(function(err) {
    if (err) {
      console.error('Error during logout:', err);
      return next(err);  // Forward the error to the error handler
    }
    res.status(200).send("Log out success");
  });
}


function loginUser(req, res) {
  req.session.currentUser = req.user;
  res.json(req.user);
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
