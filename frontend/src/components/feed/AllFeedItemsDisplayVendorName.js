import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./feedCSS/AllFeedItemsDisplayVendorName.css";

class AllFeedItemsDisplayVendorName extends Component {
  displayVendorPhoto = (vendorName) => {
    const { allVendors } = this.props;
    if (allVendors && allVendors[vendorName]) {
      return (
        <img
          className="feed-profile-pic"
          src={allVendors[vendorName]} // Fetch by vendorName
          alt={`${vendorName} Profile`} // Display vendor name in alt attribute
        />
      );
    }
    return null; // Return nothing if profile picture is missing
  };
  render() {
    const { vendorName, vendorId, foodDataObj } = this.props;
  
    return (
      <div className="display-vendor-name-feed">
        <span className="vendor-span-container">
          <Link
            to={`/clientview/${vendorId}`}
            className="display-item-name vendor-link"
          >
            {vendorName} {/* Ensure the vendor name is displayed */}
          </Link>
          <div className="vendor-address-field">
            <Link
              to={`/map?address=${encodeURIComponent(
                foodDataObj[vendorId][0]?.address_field || "Unknown"
              )}`}
              className="address-link"
            >
              {foodDataObj[vendorId][0]?.address_field || "No Address"}
            </Link>
          </div>
          <div className="vendor-account-profile-pic">
            {this.displayVendorPhoto()} {/* Display the vendor's profile picture */}
          </div>
        </span>
      </div>
    );
  }
}

export default AllFeedItemsDisplayVendorName;
