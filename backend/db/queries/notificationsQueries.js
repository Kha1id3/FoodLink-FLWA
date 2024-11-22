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

module.exports = {
  getNotificationsByUser,
  markNotificationAsRead,
  deleteNotification,
};
