const express = require("express");
const router = express.Router();
const { db } = require("../db/index.js");

router.get("/matched-items/:id", async (req, res) => {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID provided" });
  }

  try {
    const matchedItems = await db.any(
      `SELECT 
          mi.id AS matched_id, 
          requests.id AS request_id,
          donations.id AS donation_id,
          requests.name AS request_name, 
          requests.quantity AS request_quantity, 
          donations.name AS donation_name, 
          donations.quantity AS donation_quantity,
          fc.name AS category_name
       FROM matched_items mi
       JOIN food_items AS requests ON mi.request_id = requests.id
       JOIN food_items AS donations ON mi.donation_id = donations.id
       JOIN food_categories fc ON requests.category_id = fc.id
       WHERE 
           (requests.client_id = $1 OR donations.vendor_id = $1)
           AND requests.is_claimed = FALSE
           AND requests.is_matched = TRUE`,
      [userId]
    );

    res.status(200).json({ matchedItems });
  } catch (err) {
    console.error("Error fetching matched items:", err);
    res.status(500).json({ message: "Failed to fetch matched items" });
  }
});

module.exports = router;
