const express = require("express");
const router = express.Router();
const { createNotification, getNotificationsByUser, markNotificationAsRead, deleteNotification, markAllNotificationsAsRead} = require("../db/queries/notificationsQueries.js");

const { db } = require("../db/index.js"); 


// Fetch all notifications for a user
router.get("/:userId/:userType", async (req, res, next) => {
  try {
    const { userId, userType } = req.params;
    const notifications = await getNotificationsByUser(userId, userType);

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

router.patch("/mark-all-read/:userId/:userType", async (req, res, next) => {
  try {
    const { userId, userType } = req.params;
    await markAllNotificationsAsRead(userId, userType);
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
    const { id } = req.params; // Extract notification ID from the URL
    await markNotificationAsRead(id); // Call the function to update the database

    res.status(200).json({
      status: "success",
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    next(error); // Pass the error to the next middleware
  }
});
/* */

// Delete a notification
router.delete("/:Id", async (req, res, next) => {
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
    const { vendor_id, client_id, message } = req.body;

    await createNotification({ vendor_id, client_id, message });

    res.status(201).json({
      status: "success",
      message: "Notification created successfully",
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    next(error);
  }
});




module.exports = router;
