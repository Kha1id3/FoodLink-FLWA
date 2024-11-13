import React, { Component } from "react";
import axios from "axios";
import Auth from "../../utils/Auth.js";
import { Redirect } from "react-router-dom";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import Typography from "@material-ui/core/Typography";
import { MuiThemeProvider, createTheme } from "@material-ui/core/styles";
import "./authCSS/SignUp.css";

const theme = createTheme({
  palette: {
    primary: { main: "#FFA500" },
    secondary: { main: "#D35348" },
  },
});

class SignUp extends Component {
  state = {
    email: "",
    password_digest: "",
    type: 1,
    name: "",
    address_field: "",
    body: "",
    telephone_number: "",
    profile_pic: null, // Changed to hold file
    isSubmitted: false,
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleFileChange = (e) => {
    this.setState({ profile_pic: e.target.files[0] });
  };

  registerUser = async (e) => {
    e.preventDefault();
    const {
      email,
      password_digest,
      type,
      name,
      address_field,
      body,
      telephone_number,
      profile_pic,
    } = this.state;
  
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password_digest", password_digest);
    formData.append("type", type);
    formData.append("name", name);
    formData.append("address_field", address_field);
    formData.append("body", body);
    formData.append("telephone_number", telephone_number);
    formData.append("profile_pic", profile_pic);
  
    try {
      await axios.post("/api/users/new", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Auth.authenticateUser(email);
      await this.props.checkAuthenticateStatus();
      this.setState({ isSubmitted: true });
    } catch (err) {
      console.error("Error during user registration:", err);
    }
  };
  render() {
    return (
      <div id="signup-page">
        {this.state.isSubmitted && <Redirect to="/profile" />}
        <h3 id="signup-header">Join FoodLink Plate!</h3>
        <form onSubmit={this.registerUser} className="signup-form">
          <TextField
            required
            label="Name"
            name="name"
            onChange={this.handleChange}
            value={this.state.name}
            variant="outlined"
            margin="dense"
          />
          <TextField
            required
            label="Email"
            name="email"
            onChange={this.handleChange}
            value={this.state.email}
            variant="outlined"
            margin="dense"
          />
          <TextField
            required
            label="Password"
            name="password_digest"
            onChange={this.handleChange}
            value={this.state.password_digest}
            type="password"
            variant="outlined"
            margin="dense"
          />
          <TextField
            required
            label="Address"
            name="address_field"
            onChange={this.handleChange}
            value={this.state.address_field}
            variant="outlined"
            margin="dense"
          />
          <TextField
            label="Telephone Number"
            name="telephone_number"
            onChange={this.handleChange}
            value={this.state.telephone_number}
            variant="outlined"
            margin="dense"
          />

          {/* Profile picture upload */}
          <div className="icon-input-field">
            <label>Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={this.handleFileChange}
            />
          </div>

          <MuiThemeProvider theme={theme}>
            <Button type="submit" variant="contained" color="primary">
              Sign Up
            </Button>
          </MuiThemeProvider>
        </form>
      </div>
    );
  }
}

export default SignUp;
