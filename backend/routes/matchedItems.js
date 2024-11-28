const express = require("express");
const router = express.Router();
const { db } = require("../db/index.js");

router.get("/matched-items/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const matchedItems = await db.any(
      `SELECT matched_items.*, 
              requests.name AS request_name, 
              requests.quantity AS request_quantity, 
              donations.name AS donation_name, 
              donations.quantity AS donation_quantity,
              food_categories.name AS category_name
       FROM matched_items
       JOIN food_items AS requests ON matched_items.request_id = requests.id
       JOIN food_items AS donations ON matched_items.donation_id = donations.id
       JOIN food_categories ON requests.category_id = food_categories.id
       WHERE requests.client_id = $1 OR donations.vendor_id = $1`,
      [userId]
    );

    res.status(200).json({ matchedItems });
  } catch (err) {
    console.error("Error fetching matched items:", err);
    res.status(500).json({ message: "Failed to fetch matched items" });
  }
});

module.exports = router;
