import React, { useEffect, useState, useRef } from "react";
import { NavLink, useHistory } from "react-router-dom";
import "./navBarCSS/NavBar.css";
import axios from "axios";
import { format } from "date-fns";

export const LoggedInNavBar = (props) => {
  const [profilePic, setProfilePic] = useState("/images/default.jpg");
  const [notifications, setNotifications] = useState([]);
  const [imageFailed, setImageFailed] = useState(false); 
  const [showDropdown, setShowDropdown] = useState(false); // Notification dropdown visibility
  const history = useHistory();
  const dropdownRef = useRef(null);
  const [hasUnread, setHasUnread] = useState(false);

  const currentUser = props.currentUser;

  const type = props.currentUser.type === 1 ? "vendor" : "client";
  const profileLink = `/${type}/${props.currentUser.name}`;

  
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
    if (currentUser?.id && !imageFailed) {
      const fetchProfilePic = async () => {
        try {
          const response = await axios.get(`/api/users/${currentUser.id}`);
          const fetchedPic = response.data.data[0]?.profile_picture;

          // Validate if the fetched picture is a valid image URL
          const isValidImage = (url) => /\.(jpg|jpeg|png|gif)$/i.test(url);

          if (fetchedPic && isValidImage(fetchedPic)) {
            setProfilePic(fetchedPic); // Use fetched picture
          } else {
            setProfilePic("/images/default.jpg"); // Use default image
          }
        } catch (error) {
          console.error("Error fetching profile picture:", error);
          setProfilePic("/images/default.jpg"); // Fallback to default image
        }
      };

      fetchProfilePic();
    }
  }, [currentUser?.id, imageFailed]);



  // Fetch notifications
  useEffect(() => {
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
  
  
    const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };
    // Set up periodic refresh
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000); // Fetch notifications every 5 seconds
  
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [props.currentUser.id]);
  
  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
    if (!showDropdown) {
      markAllAsRead(); // Mark all notifications as read when opening the dropdown
    }
  }
  // Close dropdown on outside click
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

  // Mark a notification as read on hover
  const handleNotificationHover = async (notificationId) => {
    if (!notificationId) return; // Ensure ID is valid
    const notification = notifications.find((n) => n.id === notificationId && !n.is_read);
    if (notification) {
      try {
        const response = await axios.patch(`/api/notifications/${notificationId}/read`);
        if (response.status === 200) {
          setNotifications((prevNotifications) =>
            prevNotifications.map((n) =>
              n.id === notificationId ? { ...n, is_read: true } : n
            )
          );
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };
  
  // Redirect to claimed items page
  const redirectToClaimedItems = () => {
    history.push(type === "vendor" ? "/vendor_claimed_page" : "/claimed-items");
  };


  const handleNotificationClick = (notification) => {
    if (notification.type === "match") {
      history.push("/matched-items");
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(`/api/notifications/mark-all-read/${props.currentUser.id}/${type}`);
      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          is_read: true,
        }))
      );
      setHasUnread(false); // Update state to indicate all notifications are read
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const notificationIcon = hasUnread
  ? require("./dish hot.png") // Hot dish for new notifications
  : require("./dish cold.png"); // Cold dish for all notifications read

  // Render NavBar
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
        <NavLink
          to="/map"
          className="nav-link"
          activeClassName="nav-link--active"
        >
          Map
        </NavLink>
        {type === "vendor" ? (
          <NavLink
            to="/donate"
            className="nav-link"
            activeClassName="nav-link--active"
          >
            Donate
          </NavLink>
        ) : (
          <NavLink
            to="/feed"
            className="nav-link"
            activeClassName="nav-link--active"
          >
            Donations
          </NavLink>
        )}
        <NavLink
          to={type === "vendor" ? "/vendor_claimed_page" : "/claimed-items"}
          className="nav-link"
          activeClassName="nav-link--active"
        >
          Claimed Food
        </NavLink>
        <button
          className="nav-link"
          id="logout-button"
          onClick={async () => {
            await props.logoutUser();
            await props.history.push("/welcome");
          }}
        >
          Logout
        </button>
        {/* Notification Bell */}
        <div className="notification-bell-container" ref={dropdownRef}>
          <img
            src={notificationIcon} // Dynamic notification icon
            alt="notifications"
            className="notification-bell"
            onClick={() => {
              toggleDropdown();
              markAllAsRead(); // Mark all notifications as read when dropdown is opened
            }}
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
                        } ${notification.type === "match" ? "match" : ""}`}
                        onMouseEnter={() => handleNotificationHover(notification.id)}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="notification-content">
                          {notification.message}
                        </div>
                        <div className="notification-timestamp">
                          {new Date(notification.created_at).toLocaleDateString()}
                          <br />
                          {new Date(notification.created_at).toLocaleTimeString()}
                        </div>
                        {notification.type === "match" && (
                          <div className="match-details">
                            <p><strong>Match Found:</strong> Check your dashboard for details.</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="no-notifications">No notifications</div>
                  )}
              </div>
            </div>
          )}
        </div>
        <NavLink to={profileLink} id="profile-link">
          <img
            src={profilePic}
            alt="profile icon"
            id="profile-icon"
            className="nav-profile-icon"
            onError={(e) => {
              console.warn("Profile picture failed to load, using default.");
              e.target.src = "/images/default.png"; // Fallback to default image
            }}
          />
        </NavLink>
      </div>
    </nav>
  );
};
