import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./feedCSS/AllFeedItemsDisplayVendorName.css";

class SearchBarResultsVendorDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profilePic: "",
      vendorAddress: "Loading...",
    };
  }

  componentDidMount() {
    this.fetchVendorDetails();
  }

  fetchVendorDetails = async () => {
    const { vendorId } = this.props;

    try {
      const response = await axios.get(`/api/users/${vendorId}`);
      const vendorData = response.data.data[0];
      this.setState({
        profilePic: vendorData?.profile_picture || "/images/loading.png",
        vendorAddress: vendorData?.address_field || "No Address",
      });
    } catch (error) {
      console.error(`Error fetching details for vendor ${vendorId}:`, error);
      this.setState({
        profilePic: "/images/loading.png",
        vendorAddress: "No Address",
      });
    }
  };

  render() {
    const { vendorName, vendorId } = this.props;
    const { profilePic, vendorAddress } = this.state;

    return (
      <div className="display-vendor-name-feed">
        <div className="vendor-account-container">
          <img
            className="feed-profile-pic"
            src={profilePic}
            alt={`${vendorName} Profile`}
          />
          <div className="vendor-info-container">
            <Link
              to={`/clientview/${vendorId}`}
              className="vendor-link vendor-name-centered"
            >
              {vendorName}
            </Link>
            <Link
              to={`/map?address=${encodeURIComponent(vendorAddress)}`}
              className="address-link"
            >
              {vendorAddress}
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default SearchBarResultsVendorDisplay;
