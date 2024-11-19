import React, { Component } from "react";
import axios from "axios";
import VendorProfileEditForm from "./VendorProfileEditForm";
import "./vendorProfilesCSS/VendorProfile.css";

class VendorProfile extends Component {
  constructor() {
    super();
    this.state = {
      profilePic: "",
      phoneNumber: "",
      body: "",
    };
  }

  componentDidMount() {
    this.getProfileInfo();
  }

  getProfileInfo = () => {
    axios.get(`/api/users/${this.props.currentUser.id}`).then((info) => {
      this.setState({
        profilePic: info.data.data[0].profile_picture,
        phoneNumber: info.data.data[0].telephone_number,
        body: info.data.data[0].body,
      });
    });
  };

  render() {
    const { profilePic, phoneNumber, body } = this.state;
    const { name, address_field, email } = this.props.currentUser;

    return (
      <div className="vendor-profile-container">
        <div className="vendor-profile-card">
          <img
            className="vendor-profile-picture"
            alt="profile pic"
            src={profilePic || "default.png"}
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
