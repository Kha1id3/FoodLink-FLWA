const express = require("express");
const router = express.Router();
const { db } = require("../db/index.js");

// Fetch all categories
router.get("/", async (req, res, next) => {
  try {
    const categories = await db.any("SELECT * FROM food_categories ORDER BY name ASC");
    res.status(200).json({
      status: "success",
      categories,
      message: "Fetched all categories",
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    next(error);
  }
});

module.exports = router;
