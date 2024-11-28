const { db } = require("../index.js");

const createNotification = async ({ vendor_id, client_id, message }) => {
  if (!vendor_id && !client_id) {
    console.error("Error creating notification: Both vendor_id and client_id are missing.");
    throw new Error("Either vendor_id or client_id is required to create a notification.");
  }

  try {
    await db.none(
      `INSERT INTO notifications (vendor_id, client_id, message, is_read, created_at) 
       VALUES ($1, $2, $3, FALSE, NOW())`,
      [vendor_id || null, client_id || null, message]
    );
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

const getNotificationsByUser = async (userId, userType) => {
  const column = userType === "vendor" ? "vendor_id" : "client_id";
  return db.any(
    `SELECT * FROM notifications 
     WHERE ${column} = $1 
     ORDER BY created_at DESC`,
    [userId]
  );
};

const markAllNotificationsAsRead = async (userId, userType) => {
  const column = userType === "vendor" ? "vendor_id" : "client_id";

  try {
    await db.none(
      `UPDATE notifications 
       SET is_read = TRUE 
       WHERE ${column} = $1`,
      [userId]
    );
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error; // Ensure errors propagate for proper error handling
  }
}

const deleteNotification = (notificationId) => {
  return db.none(
    "DELETE FROM notifications WHERE id = $1",
    [notificationId]
  );
};


const markNotificationAsRead = async (notificationId) => {
  try {
    await db.none(
      `UPDATE notifications 
       SET is_read = TRUE 
       WHERE id = $1`,
      [notificationId]
    );
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error; // Ensure errors propagate for proper error handling
  }
};

module.exports = {
  createNotification,
  getNotificationsByUser,
  markNotificationAsRead,
  deleteNotification,
  markAllNotificationsAsRead, // Export the function
};
