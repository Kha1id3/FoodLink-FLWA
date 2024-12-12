import React from "react";
import "../landing/landingCSS/readmore.css";

function ReadMore() {
  return (
    <div id="about-us-page">
      <section id="mission-statement">
        <h2>Mission Statement</h2>
        <p2>
          At FoodLink, our mission is to reduce food waste and alleviate hunger
          by connecting food vendors with those in need. Our platform allows
          vendors to sign up and donate surplus food, while clients can browse
          and claim available items and keep track of their favorite vendors.
        </p2>
        <p2>
          Explore our resources for information on global food support
          initiatives and discover ways you can contribute to a world with less
          waste and more support for those in need. Check out our{" "}
          <a href="/resources">resources</a>.
        </p2>
      </section>

      <section id="get-involved">
        <h2>Get Involved</h2>
        <div className="involvement-options">
          <div className="option">
            <h3>Food Vendors</h3>
            <p2>
              Our vendors include restaurants, catering services, and others
              committed to reducing waste and supporting communities in need.
            </p2>
          </div>
          <div className="option">
            <h3>Volunteers</h3>
            <p2>
              Volunteers play a key role in supporting communities and creating
              life-changing experiences for those in need.
            </p2>
          </div>
          <div className="option">
            <h3>Non-profit Organizations</h3>
            <p2>
              Non-profits can register with FoodLink to provide essential
              resources to those in need, strengthening our shared mission.
            </p2>
          </div>
        </div>
      </section>
    </div>
  );
}

// Ensure only ONE default export exists
export default ReadMore;
