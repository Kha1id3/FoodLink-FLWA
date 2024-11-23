const { db } = require("../index.js");

const getNotificationsByUser = (userId) => {
  return db.any(
    "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
};

const markNotificationAsRead = (notificationId) => {
  return db.none("UPDATE notifications SET is_read = TRUE WHERE id = $1", [
    notificationId,
  ]);
};

const deleteNotification = (notificationId) => {
  return db.none("DELETE FROM notifications WHERE id = $1", [notificationId]);
};

const createNotification = async (userId, message) => {
  try {
    await db.none(
      "INSERT INTO notifications (user_id, message, is_read, created_at) VALUES ($1, $2, FALSE, NOW())",
      [userId, message]
    );
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

module.exports = {
  createNotification,
  getNotificationsByUser,
  markNotificationAsRead,
  deleteNotification,
};
