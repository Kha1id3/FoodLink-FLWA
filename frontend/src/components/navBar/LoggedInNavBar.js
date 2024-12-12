import React, { useEffect, useState, useRef } from "react";
import { NavLink, useHistory } from "react-router-dom";
import "./navBarCSS/NavBar.css";
import axios from "axios";

export const LoggedInNavBar = (props) => {
  const [profilePic, setProfilePic] = useState("/images/default.jpg");
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false); // Notifications dropdown visibility
  const [showLogout, setShowLogout] = useState(false); // Logout button visibility
  const [hasUnread, setHasUnread] = useState(false);
  const history = useHistory();
  const dropdownRef = useRef(null);

  const currentUser = props.currentUser;
  const type = currentUser?.type === 1 ? "vendor" : "client";
  const profileLink = `/${type}/${currentUser?.name}`;

  // Fetch the profile picture
  useEffect(() => {
    if (currentUser?.id) {
      const fetchProfilePic = async () => {
        try {
          const response = await axios.get(`/api/users/${currentUser.id}`);
          const fetchedPic = response.data.data[0]?.profile_picture || "/images/default.jpg";
          setProfilePic(fetchedPic);
        } catch (error) {
          console.error("Error fetching profile picture:", error);
          setProfilePic("/images/default.jpg");
        }
      };

      fetchProfilePic();
    }
  }, [currentUser?.id]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`/api/notifications/${currentUser.id}/${type}`);
        const fetchedNotifications = response.data.notifications || [];
        setNotifications(fetchedNotifications);

        const unread = fetchedNotifications.some((notif) => !notif.is_read);
        setHasUnread(unread);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [currentUser?.id, type]);

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.patch(`/api/notifications/mark-all-read/${currentUser.id}/${type}`);
      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          is_read: true,
        }))
      );
      setHasUnread(false);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
    if (!showDropdown) markAllAsRead();
  };

  const handleProfileClick = () => {
    setShowLogout((prev) => !prev); // Toggle logout button visibility
  };

  const handleProfilePicClick = () => {
    history.push(profileLink); // Redirect to profile page
  };

  const notificationIcon = hasUnread
    ? require("./dish hot.png") // Hot dish for new notifications
    : require("./dish cold.png"); // Cold dish for all notifications read

  return (
    <nav id="nav">
      <span id="nav-title">
        <NavLink to="/welcome" className="nav-link">
          <img
            src={require("../landing/images/FoodLink Logo.png")}
            alt="logo for foodlink"
            id="logo"
          />
        </NavLink>
      </span>
      <div id="nav-links">
        <NavLink to="/map" className="nav-link">
          Map
        </NavLink>
        {type === "vendor" ? (
          <NavLink to="/donate" className="nav-link">
            Donate
          </NavLink>
        ) : (
          <NavLink to="/feed" className="nav-link">
            Donations
          </NavLink>
        )}
        <NavLink
          to={type === "vendor" ? "/vendor_claimed_page" : "/claimed-items"}
          className="nav-link"
        >
          Claimed Food
        </NavLink>

        {/* Notifications */}
        <div className="notification-bell-container" ref={dropdownRef}>
          <img
            src={notificationIcon}
            alt="notifications"
            className="notification-bell"
            onClick={toggleDropdown}
          />
          {showDropdown && (
            <div className="notification-panel notification-panel-visible">
              <div className="notification-items">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${
                        notification.is_read ? "read" : "unread"
                      }`}
                    >
                      <div className="notification-content">{notification.message}</div>
                      <div className="notification-timestamp">
                        {new Date(notification.created_at).toLocaleDateString()}
                        <br />
                        {new Date(notification.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-notifications">No notifications</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Section */}
        <div id="profile-link" onClick={handleProfileClick}>
          <img
            src={profilePic}
            alt="profile icon"
            id="profile-icon"
            onClick={handleProfilePicClick} // Redirect to profile page
            onError={(e) => (e.target.src = "/images/default.jpg")}
          />
          {showLogout && (
            <button
              id="logout-button"
              onClick={async () => {
                try {
                  await props.logoutUser();
                  history.push("/welcome");
                } catch (error) {
                  console.error("Error during logout:", error);
                }
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
