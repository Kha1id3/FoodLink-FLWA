import React, { useEffect, useState, useRef } from "react";
import { NavLink, useHistory } from "react-router-dom";
import "./navBarCSS/NavBar.css";
import axios from "axios";
import { format } from "date-fns";

export const LoggedInNavBar = (props) => {
  const [profilePic, setProfilePic] = useState(""); // Store profile picture URL
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false); // Notification dropdown visibility
  const [hasUnread, setHasUnread] = useState(false);
  const history = useHistory();
  const dropdownRef = useRef(null);

  const type = props.currentUser?.type === 1 ? "vendor" : "client"; // Handle undefined currentUser gracefully
  const profileLink = props.currentUser
    ? `/${type}/${props.currentUser.name}`
    : "";

  // Format expiry date helper
  const formatExpiryDate = (isoString) => {
    try {
      return format(new Date(isoString), "MMMM dd, yyyy hh:mm a");
    } catch (error) {
      console.error("Error formatting expiry date:", error);
      return "Invalid Date";
    }
  };

  // Fetch the profile picture
  useEffect(() => {
    if (!props.currentUser) return; // Avoid unnecessary API calls
    const fetchProfilePic = async () => {
      try {
        const response = await axios.get(`/api/users/${props.currentUser.id}`);
        setProfilePic(response.data.data[0].profile_picture || "/images/default.jpg");
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };
    fetchProfilePic();
  }, [props.currentUser]);

  // Fetch notifications
  useEffect(() => {
    if (!props.currentUser) return; // Avoid unnecessary API calls
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `/api/notifications/${props.currentUser.id}/${type}`
        );
        const fetchedNotifications = response.data.notifications || [];
        setNotifications(fetchedNotifications);

        // Check for unread notifications
        const unread = fetchedNotifications.some((notif) => !notif.is_read);
        setHasUnread(unread);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    // Periodic refresh
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval); // Cleanup on unmount
  }, [props.currentUser, type]);

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.patch(
        `/api/notifications/mark-all-read/${props.currentUser.id}/${type}`
      );
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

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
    if (!showDropdown) markAllAsRead();
  };

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        {props.currentUser ? (
          <>
            {/* Logged-in Navigation Links */}
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
            <button
              className="nav-link"
              id="logout-button"
              onClick={async () => {
                await props.logoutUser();
                await history.push("/welcome");
              }}
            >
              Logout
            </button>
            {/* Notification Bell */}
            <div
              className="notification-bell-container"
              ref={dropdownRef}
              onClick={toggleDropdown}
            >
              <img
                src={notificationIcon}
                alt="notifications"
                className="notification-bell"
              />
            </div>
            {/* Dropdown */}
            {showDropdown && (
  <div
    className={`notification-panel ${
      showDropdown ? "notification-panel-visible" : "notification-panel-hidden"
    }`}
  >
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
              {formatExpiryDate(notification.created_at)}
            </div>
          </div>
        ))
      ) : (
        <div className="no-notifications">No notifications</div>
      )}
    </div>
  </div>
)}
            <NavLink to={profileLink} id="profile-link">
              <img
                src={profilePic}
                alt="profile icon"
                id="profile-icon"
                className="nav-profile-icon"
              />
            </NavLink>
          </>
        ) : (
          <>
            {/* Non-logged-in Navigation Links */}
            <NavLink to="/user/login" className="nav-link">
              Login
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};
