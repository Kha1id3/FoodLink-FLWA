const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  getAllUsers,
  getAllVendors,
  getAllClients,
  updateUser,
  deleteUser,
  getSingleUser,
  createUser,
} = require("../db/queries/usersQueries.js");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory where files are saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename with extension
  },
});

const upload = multer({ storage: storage });

// Routes
router.get("/", getAllUsers);
router.get("/vendors", getAllVendors);
router.get("/clients", getAllClients);
router.get("/:id", getSingleUser);

// Use multer middleware for profile picture upload in createUser
router.post("/new", upload.single("profile_pic"), (req, res, next) => {
  if (req.file) {
    req.body.profile_pic = `/uploads/${req.file.filename}`; // Store file path
  }
  createUser(req, res, next);
});

// Use multer middleware for profile picture upload in updateUser
router.patch("/:id", upload.single("profile_pic"), (req, res, next) => {
  if (req.file) {
    req.body.profile_pic = `/uploads/${req.file.filename}`;
  }
  updateUser(req, res, next);
});

router.delete("/:id", deleteUser);

module.exports = router;
