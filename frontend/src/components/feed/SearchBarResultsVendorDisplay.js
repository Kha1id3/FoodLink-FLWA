import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";


class SearchBarResultsVendorDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profilePic: "", // State to hold the dynamically fetched profile picture
      vendorAddress: "Loading...", // Placeholder for vendor address
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
        profilePic: vendorData?.profile_picture || "default.png",
        vendorAddress: vendorData?.address_field || "No Address",
      });
    } catch (error) {
      console.error(`Error fetching details for vendor ${vendorId}:`, error);
      this.setState({
        profilePic: "default.png",
        vendorAddress: "No Address",
      });
    }
  };

  render() {
    const { vendorName, vendorId } = this.props;
    const { profilePic, vendorAddress } = this.state;

    return (
      <div className="display-vendor-name-feed-search">
        <Link to={`/clientview/${vendorId}`} className="display-item-name">
          {vendorName}
        </Link>
        <div className="vendor-address-field">
          <Link
            to={`/map?address=${encodeURIComponent(vendorAddress)}`}
            className="address-link"
          >
            {vendorAddress}
          </Link>
        </div>
        <div className="vendor-account-profile-pic">
          <img
            className="feed-profile-pic"
            src={profilePic}
            alt={`${vendorName} Profile`}
          />
        </div>
      </div>
    );
  }
}

export default SearchBarResultsVendorDisplay;
