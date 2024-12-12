import React from "react";
import { NavLink } from "react-router-dom";

import "./navBarCSS/NavBar.css";

export default function NavBar() {
  return (
    <div>
      <nav id="navbar">
        <span id="nav-title2">
          <NavLink to="/welcome" className="nav-link2">
            <img
              src={require("../landing/images/FoodLink Logo.png")}
              alt="logo for FoodLink"
              id="logo"
            />
          </NavLink>
        </span>

        <div id="nav-link2s">
          <NavLink
            to="/aboutus"
            className="nav-link2"
            activeClassName="nav-link2--active">
            Team
          </NavLink>
          <NavLink
            to="/resources"
            className="nav-link2"
            activeClassName="nav-link2--active">
            Resources
          </NavLink>
          <NavLink
            to="/user/signup"
            className="nav-link2"
            activeClassName="nav-link2--active">
            Get Started
          </NavLink>
          <NavLink
            to="/user/login"
            className="nav-link2"
            activeClassName="nav-link2--active">
            Login
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
