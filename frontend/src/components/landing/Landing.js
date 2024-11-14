import React from "react";
import { NavLink } from "react-router-dom";
import Button from "@material-ui/core/Button";
import Carousel from "./Carousel.js";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./landingCSS/Landing.css";

const buttonColor = createMuiTheme({
  palette: {
    primary: { 500: "#5C4E4E" },
    secondary: {
      main: "#5C4E4E"
    }
  },
  typography: {
    useNextVariants: true
  }
});

export default function Landing() {
  return (
    <div className="landing-wrapper">
      <div className="carousel-wrapper">
        <Carousel />
      </div>
      <div id="line1" />
      <div id="food-background-container" />
      <div id="landing-container">
        <div>
          <h1 id="mission-statement">Mission Statement</h1>
        </div>
        <div id="mission-statement-container">
          <p id="mission-statement-text">
          At FoodLink, our mission is to reduce food waste and alleviate hunger by connecting food vendors with those in need. Our platform allows vendors to sign up and donate surplus food, while clients can browse and claim available items and keep track of their favorite vendors. Explore our resources for information on global food support initiatives and discover ways you can contribute to a world with less waste and more support for those in need. Check out our{" "}
            {""}
            <NavLink to="/resources" id="resources-link">
              resources
            </NavLink>{" "}.
          </p>
        </div>
      </div>
      <div id="line2" />
      <div id="info-container">
        <div id="info-vendor-volunteer-client">
          <h1 id="info-container-header">Get Involved</h1>
          <div id="info-vendor">
            <img
              src={require("./images/vendor.png")}
              alt="icon for vendor"
              id="vendor-logo"
            />
            <h3 id="user-type">Food Vendors</h3>
            <div>
              <div id="get-involved-info">
              Our vendors include restaurants, catering services, nursing homes, and other food providers who are committed to reducing waste and supporting communities in need. Sign up or log in using the links below to start donating surplus food and make a positive impact. Food donations through FoodLink are also eligible for tax benefits.
              </div>
            </div>
          </div>
          <div id="info-volunteer">
            <img
              src={require("./images/client.png")}
              alt="icon for vendor"
              id="volunteer-logo"
            />
            <h3 id="user-type">Volunteers</h3>
            <div>
              <div id="get-involved-info">
              When you volunteer with FoodLink, you’re helping to fight hunger and reduce food waste. Your role as a volunteer directly supports communities and creates life-changing experiences for those around you. Join us to make a meaningful impact in your city and beyond
              </div>
            </div>
          </div>
          <div id="info-client">
            <img
              src={require("./images/npo-solid-black.png")}
              alt="icon for client"
              id="client-logo"
            />
            <h3 id="user-type">Non-profit Organizations</h3>
            <div>
              <div id="get-involved-info">
              Non-profit organizations, such as community centers, shelters, and support groups, can register with FoodLink to receive food donations. This network allows organizations to provide essential resources to those in need, strengthening our shared mission to fight hunger together. Sign up or log in below to get started.
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="line" />
      <div id="login-container">
        <div className="login-sub-container-1">
          <NavLink to="/user/signup" id="nav-link">
            <MuiThemeProvider theme={buttonColor}>
              <Button
                variant="contained"
                color="primary"
                disableunderline="true"
                type="submit"
                id="signup-button"
              >
                Get Started
              </Button>
            </MuiThemeProvider>
          </NavLink>
        </div>
        <div className="login-sub-container-2">
          <NavLink to="/user/login" id="nav-link">
            <MuiThemeProvider theme={buttonColor}>
              <Button
                variant="contained"
                color="secondary"
                disableunderline="true"
                type="submit"
                id="login-button"
              >
                Log In
              </Button>
            </MuiThemeProvider>
          </NavLink>
        </div>
      </div>
    </div>
  );
}
