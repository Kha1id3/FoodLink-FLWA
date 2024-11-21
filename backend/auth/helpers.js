
const bcrypt = require("bcryptjs");

function comparePass(userPass, databasePass) {
  try {
    return bcrypt.compareSync(userPass, databasePass);
  } catch (err) {
    console.error("Error comparing passwords:", err);
    return false;
  }
}

function createHash(password) {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

function loginRequired(req, res, next) {

  if (!req.user) {
    res.status(401).json({ status: "Forbidden - please log in." });
    return;
  }
  next();
}

module.exports = {
  comparePass,
  createHash,
  loginRequired
};
