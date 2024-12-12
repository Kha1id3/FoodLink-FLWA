import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../feed/feedCSS/AllFeedItemsDisplayVendorName.css";

class AllFeedItemsDisplayVendorName extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profilePic: props.vendorProfilePic || "/images/loading.png", // Fallback to prop or default
    };
  }

  componentDidMount() {
    if (!this.props.vendorProfilePic) {
      this.fetchVendorProfilePicture();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.vendorId !== this.props.vendorId) {
      this.fetchVendorProfilePicture();
    }
  }

  fetchVendorProfilePicture = async () => {
    const { vendorId } = this.props;
  
    try {
      const response = await axios.get(`/api/users/${vendorId}`);
      const profilePic = response.data.data[0]?.profile_picture || "/images/loading.png";
      this.setState({ profilePic });
    } catch (error) {
      console.error(`Error fetching profile picture for vendor ${vendorId}:`, error);
    }
  };

  render() {
    const { vendorName, vendorId, vendorAddress } = this.props;
    const { profilePic } = this.state;

    return (
      <div className="vendor-card">
        {/* Profile Picture Section */}
        <div
          className="vendor-profile-pic-top"
          style={{
            backgroundImage: `url(${profilePic})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        {/* Vendor Details */}
        <div className="vendor-details">
          <Link to={`/clientview/${vendorId}`} className="vendor-name-link">
            {vendorName}
          </Link>
          <Link
            to={`/map?address=${encodeURIComponent(vendorAddress || "Unknown")}`}
            className="vendor-address-link"
          >
            {vendorAddress || "No Address"}
          </Link>
        </div>
      </div>
    );
  }
}

export default AllFeedItemsDisplayVendorName;
