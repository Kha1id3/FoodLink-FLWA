import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "./navBarCSS/NavBar.css";
import axios from "axios";

export const LoggedInNavBar = (props) => {
  const [profilePic, setProfilePic] = useState(""); // Store profile picture URL
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false); // State to control panel visibility

  let type;
  if (props.currentUser.type === 1) {
    type = "vendor";
  } else {
    type = "client";
  }

  let profileLink = `/${type}/${props.currentUser.name}`;

  // Fetch the profile picture
  useEffect(() => {
    const fetchProfilePic = async () => {
      try {
        const response = await axios.get(`/api/users/${props.currentUser.id}`);
        setProfilePic(response.data.data[0].profile_picture || "default.png");
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };
    fetchProfilePic();
  }, [props.currentUser.id]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `/api/notifications/${props.currentUser.id}`
        );
        const latestNotifications = response.data.notifications.slice(0, 5); // Fetch latest 5 notifications
        setNotifications(latestNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, [props.currentUser.id]);

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
        <NavLink
          to="/donate"
          className="nav-link"
          activeClassName="nav-link--active"
        >
          Donate
        </NavLink>
        <NavLink
          to="/claimed-items"
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
        <div className="notification-bell-container">
          <img
            src={require("./bell-icon.png")}
            alt="notifications"
            className="notification-bell"
            onClick={() => setShowPanel(!showPanel)}
          />
        </div>
        <NavLink to={profileLink} id="profile-link">
          <img
            src={profilePic}
            alt="profile icon"
            id="profile-icon"
            className="nav-profile-icon"
          />
        </NavLink>
      </div>
      {/* Notification Panel */}
      <div
        className={`notification-panel ${
          showPanel ? "notification-panel-visible" : "notification-panel-hidden"
        }`}
      >

        <div className="notification-items">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <div key={index} className="notification-item">
                {notification.message}
              </div>
            ))
          ) : (
            <div className="no-notifications">No notifications</div>
          )}
        </div>
      </div>
    </nav>
  );
};
