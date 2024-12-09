import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./feedCSS/AllFeedItemsDisplayVendorName.css";

class AllFeedItemsDisplayVendorName extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profilePic: "", // State to hold the dynamically fetched profile picture
    };
  }

  componentDidMount() {
    this.fetchVendorProfilePicture();
  }

  fetchVendorProfilePicture = async () => {
    const { vendorId } = this.props;

    try {
      const response = await axios.get(`/api/users/${vendorId}`);
      const profilePic = response.data.data[0]?.profile_picture || "default.png";
      this.setState({ profilePic });
    } catch (error) {
      console.error(`Error fetching profile picture for vendor ${vendorId}:`, error);
    }
  };

  displayVendorPhoto = () => {
    const { profilePic } = this.state;

    if (profilePic) {
      return (
        <img
          className="feed-profile-pic"
          src={profilePic} // Use the dynamically fetched profile picture
          alt="Vendor Profile"
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
