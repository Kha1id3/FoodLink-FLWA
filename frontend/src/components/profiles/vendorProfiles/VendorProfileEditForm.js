import React, { Component } from "react";
import axios from "axios";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import "./vendorProfilesCSS/VendorProfileEditForm.css";

class VendorProfileEditForm extends Component {
  constructor() {
    super();
    this.state = {
      editProfileButton: false,
      name: "",
      email: "",
      address_field: "",
      body: "",
      telephone_number: "",
      ein: "",
    };
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  toggleEditFormLogic = () => {
    this.setState({
      editProfileButton: !this.state.editProfileButton,
    });
  };

  displayEditForm = () => {
    return (
      <div id="vendor-edit-form-container">
        <form id="vendor-edit-form" autoComplete="off" onSubmit={this.handleSubmit}>
          <div className="icon-input-field">
            <TextField
              label="Name"
              margin="normal"
              onChange={this.handleChange}
              name="name"
              value={this.state.name}
              type="text"
              placeholder="Enter Name"
              fullWidth
            />
          </div>
          <div className="icon-input-field">
            <TextField
              label="Email"
              margin="normal"
              onChange={this.handleChange}
              name="email"
              value={this.state.email}
              type="text"
              placeholder="Enter Email"
              fullWidth
            />
          </div>
          <div className="icon-input-field">
            <TextField
              label="Address"
              margin="normal"
              onChange={this.handleChange}
              name="address_field"
              value={this.state.address_field}
              type="text"
              placeholder="Enter Address"
              fullWidth
            />
          </div>
          <div className="icon-input-field">
            <TextField
              label="Description"
              margin="normal"
              onChange={this.handleChange}
              name="body"
              value={this.state.body}
              type="text"
              placeholder="Enter Description"
              fullWidth
            />
          </div>
          <div className="icon-input-field">
            <TextField
              label="Telephone Number"
              margin="normal"
              onChange={this.handleChange}
              name="telephone_number"
              value={this.state.telephone_number}
              type="text"
              placeholder="Enter Telephone Number"
              fullWidth
            />
          </div>
          <div className="icon-input-field">
            <TextField
              label="EIN"
              margin="normal"
              onChange={this.handleChange}
              name="ein"
              value={this.state.ein}
              type="text"
              placeholder="Enter EIN"
              fullWidth
            />
          </div>
          <div id="vendor-edit-form-button-container">
            <Button variant="contained" color="primary" type="submit">
              Submit
            </Button>
          </div>
        </form>
      </div>
    );
  };

  updateInfo = () => {
    axios
      .patch(`/api/users/${this.props.id}`, {
        name: this.state.name,
        email: this.state.email,
        address_field: this.state.address_field,
        body: this.state.body,
        telephone_number: this.state.telephone_number,
        ein: this.state.ein,
      })
      .then(() => {
        this.setState({
          name: "",
          email: "",
          address_field: "",
          body: "",
          telephone_number: "",
          ein: "",
          editProfileButton: false,
        });
      })
      .catch((err) => {
        console.error("Error updating vendor info:", err);
      });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.updateInfo();
  };

  render() {
    return (
      <div className="VendorFormMainPage">
        <Button
          variant="contained"
          color="primary"
          onClick={this.toggleEditFormLogic}
        >
          {this.state.editProfileButton ? "Close Edit Form" : "Edit Profile"}
        </Button>
        {this.state.editProfileButton ? this.displayEditForm() : null}
      </div>
    );
  }
}

export default VendorProfileEditForm;
