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
          src={allVendors[vendorName]}
          alt={`${vendorName} Profile`}
        />
      );
    }
    return null;
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
            {this.displayVendorPhoto(vendorName)} {/* Display vendor photo */}
          </div>
        </span>
      </div>
    );
  }
}

export default AllFeedItemsDisplayVendorName;
