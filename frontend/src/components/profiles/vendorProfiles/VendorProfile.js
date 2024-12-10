import React, { Component } from "react";
import axios from "axios";
import VendorProfileEditForm from "./VendorProfileEditForm";
import "./vendorProfilesCSS/VendorProfile.css";

class VendorProfile extends Component {
  constructor() {
    super();
    this.state = {
      profilePic: "/images/default.jpg", // Default profile picture
      phoneNumber: "",
      body: "",
    };
  }

  componentDidMount() {
    this.getProfileInfo();
  }

  getProfileInfo = () => {
    axios
      .get(`/api/users/${this.props.currentUser.id}`)
      .then((info) => {
        const fetchedPic = info.data.data[0]?.profile_picture || "/images/default.jpg";
        this.setState({
          profilePic: fetchedPic,
          phoneNumber: info.data.data[0]?.telephone_number || "N/A",
          body: info.data.data[0]?.body || "No description provided",
        });
      })
      .catch((err) => {
        console.error("Error fetching profile information:", err);
        this.setState({ profilePic: "/images/default.jpg" }); // Fallback to default image
      });
  };

  handleLogout = async () => {
    await this.props.logoutUser();
    await this.props.history.push("/welcome");
  };

  render() {
    const { profilePic, phoneNumber, body } = this.state;
    const { name, address_field, email } = this.props.currentUser;

    return (
      <div className="vendor-profile-container">
        {/* Logout Icon */}
        <div className="vendor-profile-card">
          <img
            className="vendor-profile-picture"
            alt="Profile"
            src={profilePic}
            onError={(e) => {
              console.warn("Profile picture failed to load, using default.");
              e.target.src = "/images/default.jpg"; // Fallback to default image
            }}
          />
          <h1 className="vendor-profile-name">{name}</h1>
          <div className="vendor-contact-container">
            <h3>Contact Us</h3>
            <p>
              <span>{address_field}</span> <br />
              <span>{email}</span> <br />
              <span>{phoneNumber}</span>
            </p>
          </div>
          <div className="vendor-description-container">
            <h3>Description</h3>
            <p>{body}</p>
          </div>
          <div className="vendor-edit-form-container">
            <VendorProfileEditForm id={this.props.currentUser.id} />
          </div>
        </div>
      </div>
    );
  }
}

export default VendorProfile;