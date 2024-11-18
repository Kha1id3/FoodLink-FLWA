import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "./navBarCSS/NavBar.css";
import axios from "axios";

export const LoggedInNavBar = (props) => {
  const [profilePic, setProfilePic] = useState(""); // Store profile picture URL

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

  // Render for Client
  if (type === "client") {
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
            to="/feed"
            className="nav-link"
            activeClassName="nav-link--active"
          >
            Donations
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
          <NavLink to={profileLink} id="profile-link">
            <img
              src={profilePic}
              alt="profile icon"
              id="profile-icon"
              className="nav-profile-icon"
            />
          </NavLink>
        </div>
      </nav>
    );
  }

  // Render for Vendor
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
          to="/vendor_claimed_page"
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
        <NavLink to={profileLink} id="profile-link">
          <img
            src={profilePic}
            alt="profile icon"
            id="profile-icon"
            className="nav-profile-icon"
          />
        </NavLink>
      </div>
    </nav>
  );
};
