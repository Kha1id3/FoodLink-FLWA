import React, { Component } from "react";
import ClientProfileEditForm from "./ClientProfileEditForm.js";
import DisplayClientFavorites from "./DisplayClientFavorites.js";
import MainSnackbarContainer from "../../../containers/MainSnackbarContainer.js";
import axios from "axios";
import "./clientProfileCSS/ClientProfile.css";

class ClientProfile extends Component {
  constructor() {
    super();
    this.state = {
      profilePic: "",
    };
  }

  componentDidMount() {
    this.reloadUser();
    this.getProfilePic();
  }

  getProfilePic = () => {
    axios
      .get(`/api/users/${this.props.currentUser.id}`)
      .then((res) => {
        const profilePicPath = res.data.data[0]?.profile_picture || "default-profile.png";
        this.setState({
          profilePic: `${process.env.REACT_APP_API_URL || ""}${profilePicPath}`,
        });
      })
      .catch((err) => {
        console.error("Error fetching profile picture:", err);
        this.setState({ profilePic: "/default-profile.png" });
      });
  };

  reloadUser = () => {
    if (!this.props.currentUser) {
      return this.props.checkAuthenticateStatus();
    }
  };

  render() {
    return (
      <div className="client-profile-container">
        <MainSnackbarContainer />
        <div className="client-profile-card">
          <div className="profile-picture-wrapper">
            <img
              className="client-profile-picture"
              src={this.state.profilePic}
              alt="Profile"
            />
          </div>
          <h2 className="client-profile-name">{this.props.currentUser.name}</h2>

          <div className="client-contact-container">
            <h3>Contact Us</h3>
            <p>
              <span>{this.props.currentUser.address_field}</span>
              <br />
              <span>{this.props.currentUser.email}</span>
            </p>
          </div>

          <div className="client-edit-form">
            <ClientProfileEditForm id={this.props.currentUser.id} />
          </div>
        </div>

        <div className="client-favorites-wrapper">
          <h2 className="client-favorites-header">Favorite Vendors</h2>
          <div className="client-favorites-container">
            <div className="client-favorites-header-row">
              <h4>Name</h4>
              <h4>Address</h4>
              <h4>Phone Number</h4>
            </div>
            <DisplayClientFavorites
              currentUserName={this.props.currentUser.name}
              receivedOpenSnackbar={this.props.receivedOpenSnackbar}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default ClientProfile;
