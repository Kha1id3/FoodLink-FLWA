const express = require("express");
const router = express.Router();
const { db } = require("../db/index.js");

// Fetch all notifications for a user
router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const notifications = await db.any(
      `SELECT * FROM notifications 
       WHERE user_id = $1 OR client_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );
    res.status(200).json({
      status: "success",
      notifications,
      message: "Fetched all notifications for the user",
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    next(error);
  }
});
// Mark a notification as read
/* */
router.patch("/mark-all-read/:userId", async (req, res, next) => {
    try {
      const { userId } = req.params;
      await db.none("UPDATE notifications SET is_read = TRUE WHERE user_id = $1", [
        userId,
      ]);
      res.status(200).json({
        status: "success",
        message: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      next(error);
    }
  });

router.patch("/:id/read", async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.none("UPDATE notifications SET is_read = TRUE WHERE id = $1", [
      id,
    ]);
    res.status(200).json({
      status: "success",
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    next(error);
  }
});
/* */

// Delete a notification
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.none("DELETE FROM notifications WHERE id = $1", [id]);
    res.status(200).json({
      status: "success",
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    next(error);
  }
});

// Add a new notification
router.post("/", async (req, res, next) => {
  try {
    const { user_id, message } = req.body;
    await db.none(
      "INSERT INTO notifications (user_id, message, is_read) VALUES ($1, $2, $3)",
      [user_id, message, false]
    );
    res.status(201).json({
      status: "success",
      message: "Notification created successfully",
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    next(error);
  }
});


router.patch("/:id/read", async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.none("UPDATE notifications SET is_read = TRUE WHERE id = $1", [
      id,
    ]);
    res.status(200).json({
      status: "success",
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    next(error);
  }
});

module.exports = router;
