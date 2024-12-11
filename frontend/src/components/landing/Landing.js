import React from "react";
import { useHistory } from "react-router-dom";
import "../landing/landingCSS/Landing.css";
import homepageImage from "./images/homepage.png";

const Landing = () => {
  const history = useHistory();

  const handleReadMoreClick = () => {
    history.push("/read-more");
  };

  return (
    <div id="food-donation">
      {/* Left Section: Title and Intro */}
      <div className="content">
        <h1 className="landing-title">FLWA</h1>
        <p className="landing-intro">
        Help us reduce food waste and support communities in need. Join us in
        </p>
        <button onClick={handleReadMoreClick} id="read-more-button">
          Read More
        </button>
      </div>

      {/* Right Section: Image */}
      <div className="image-container">
        <img
          src={homepageImage}
          alt="Food Donation Illustration"
        />
      </div>
    </div>
  );
};

export default Landing;
