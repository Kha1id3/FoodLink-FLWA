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
import "./authCSS/SignUp.css";
import Typography from "@material-ui/core/Typography";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";

const orange = createMuiTheme({
  palette: {
    primary: { 500: "#FFA500" },
    secondary: {
      main: "#D35348"
    }
  },
  typography: {
    useNextVariants: true,
    primary: {}
  }
});

const blue = createMuiTheme({
  palette: {
    primary: { 500: "#FF0000" },
    secondary: {
      main: "#FF0000"
    }
  },
  typography: {
    useNextVariants: true
  }
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
    client_certificate: "",
    ein: "",
    profile_pic: "",
    isSubmitted: false
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  registerUser = async e => {
    e.preventDefault();

    const {
      email,
      password_digest,
      type,
      name,
      address_field,
      body,
      telephone_number,
      client_certificate,
      ein,
      profile_pic
    } = this.state;

    Number(this.state.type) === 1
      ? await axios.post("/api/users/new", {
          email,
          password_digest,
          type,
          name,
          address_field,
          body,
          telephone_number,
          ein,
          profile_pic
        })
      : await axios.post("/api/users/new", {
          email,
          password_digest,
          type,
          name,
          address_field,
          body,
          telephone_number,
          client_certificate,
          profile_pic
        });

    Auth.authenticateUser(email);

    Number(this.state.type) === 1
      ? await axios.post("/api/sessions/login", {
          email,
          password_digest,
          type,
          name,
          address_field,
          body,
          telephone_number,
          ein,
          profile_pic
        })
      : await axios.post("/api/sessions/login", {
          email,
          password_digest,
          type,
          name,
          address_field,
          body,
          telephone_number,
          client_certificate,
          profile_pic
        });

    await this.props.checkAuthenticateStatus();

    this.setState({
      email: "",
      password_digest: "",
      type: "",
      name: "",
      address_field: "",
      body: "",
      telephone_number: "",
      client_certificate: "",
      ein: "",
      profile_pic: "",
      isSubmitted: true
    });
  };

  signUpForm = () => {
    if (Number(this.state.type) === 1) {
      return (
        <form
          onSubmit={this.registerUser}
          className="signup-form"
          id="vendor-signup-form">
          <h1 className="signup-form-header">Food Vendor</h1>
          <div className="icon-input-field">
            <img
              src={require("./icons/name.png")}
              alt="name"
              className="icons"
            />
            <TextField
              required
              className="input-field"
              label="Name"
              margin="dense"
              variant="outlined"
              onChange={this.handleChange}
              type="text"
              name="name"
              placeholder="Business Name"
              value={this.state.name}
            />
          </div>
          <div className="icon-input-field">
            <img
              src={require("./icons/email.png")}
              alt="email"
              className="icons"
            />
            <TextField
              required
              className="input-field"
              label="Email"
              margin="dense"
              variant="outlined"
              onChange={this.handleChange}
              type="text"
              name="email"
              placeholder="Email"
              value={this.state.email}
            />
          </div>
          <div className="icon-input-field">
            <img
              src={require("./icons/password.png")}
              alt="password"
              className="icons"
            />
            <TextField
              required
              className="input-field"
              label="Password"
              margin="dense"
              variant="outlined"
              onChange={this.handleChange}
              type="password"
              name="password_digest"
              placeholder="Password"
              value={this.state.password_digest}
            />
          </div>
          <div className="icon-input-field">
            <img
              src={require("./icons/address.png")}
              alt="address"
              className="icons"
            />
            <TextField
              required
              className="input-field"
              label="Address"
              margin="dense"
              variant="outlined"
              onChange={this.handleChange}
              type="text"
              name="address_field"
              placeholder="Address"
              value={this.state.address_field}
            />
          </div>
          <div className="icon-input-field">
            <img
              src={require("./icons/phone.png")}
              alt="phone"
              className="icons"
            />
            <TextField
              required
              className="input-field"
              label="Telephone Number"
              margin="dense"
              variant="outlined"
              onChange={this.handleChange}
              type="text"
              name="telephone_number"
              placeholder="Telephone Number"
              value={this.state.telephone_number}
            />
          </div>
          <div className="icon-input-field">
            <img
              src={require("./icons/info.png")}
              alt="info"
              className="icons"
            />
            <TextField
              className="input-field"
              label="Business Info"
              margin="dense"
              variant="outlined"
              onChange={this.handleChange}
              type="text"
              name="body"
              placeholder="Business Info"
              value={this.state.body}
            />
          </div>
          <div className="icon-input-field">
            <img src={require("./icons/id.png")} alt="id" className="icons" />
            <TextField
              className="input-field"
              label="Employee ID Number"
              margin="dense"
              variant="outlined"
              onChange={this.handleChange}
              type="text"
              name="ein"
              placeholder="Employee ID Number"
              value={this.state.ein}
            />
          </div>
          <div className="icon-input-field">
            <img
              src={require("./icons/profile-pic.png")}
              alt="profile pic"
              className="icons"
            />
            <TextField
              required
              className="input-field"
              label="Profile Picture (URL)"
              margin="dense"
              variant="outlined"
              onChange={this.handleChange}
              type="text"
              name="profile_pic"
              placeholder="Profile Picture"
              value={this.state.profile_pic}
            />
          </div>
          <div className="signup-demo-buttons">
            <MuiThemeProvider theme={orange}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className="signup-button">
                Sign Up
              </Button>
            </MuiThemeProvider>
            <br />
            <MuiThemeProvider theme={blue}>
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                className="signup-button"
                onClick={this.vendorDemoLogin}>
                Vendor Demo
              </Button>
            </MuiThemeProvider>
          </div>
        </form>
      );
    } else if (Number(this.state.type) === 2) {
      return (
        <form
          onSubmit={this.registerUser}
          className="signup-form"
          id="client-signup-form">
          <h1 className="signup-form-header">Non-Profit Org</h1>
          <div className="icon-input-field">
            <img
              src={require("./icons/name.png")}
              alt="name"
              className="icons"
            />
            <TextField
              required
              className="input-field"
              label="Name"
              margin="dense"
              variant="outlined"
              onChange={this.handleChange}
              type="text"
              name="name"
              placeholder="Non-Profit Name"
              value={this.state.name}
            />
          </div>
          <div className="icon-input-field">
            <img
              src={require("./icons/email.png")}
              alt="email"
              className="icons"
            />
            <TextField
              required
              className="input-field"
              label="Email"
              margin="dense"
              variant="outlined"
              onChange={this.handleChange}
              type="text"
              name="email"
              placeholder="Email"
              value={this.state.email}
            />
          </div>
          <div className="icon-input-field">
            <img
              src={require("./icons/password.png")}
              alt="password"
              className="icons"
            />
            <TextField
              required
              className="input-field"
              label="Password"
              margin="dense"
              variant="outlined"
              onChange={this.handleChange}
              type="password"
              name="password_digest"
              placeholder="Password"
              value={this.state.password_digest}
            />
          </div>
          <div className="icon-input-field">
            <img
              src={require("./icons/address.png")}
              alt="address"
              className="icons"
            />
            <TextField
              required
              className="input-field"
              label="Address"
              margin="dense"
              variant="outlined"
              onChange={this.handleChange}
              type="text"
              name="address_field"
              placeholder="Address"
              value={this.state.address_field}
            />
          </div>
          <div className="icon-input-field">
            <img
              src={require("./icons/certificate.png")}
              alt="certificate"
              className="icons"
            />
            <TextField
              required
              className="input-field"
              label="Client Certificate"
              margin="dense"
              variant="outlined"
              onChange={this.handleChange}
              type="text"
              name="client_certificate"
              placeholder="Client Certificate"
              value={this.state.client_certificate}
            />
          </div>
          <div className="icon-input-field">
            <img
              src={require("./icons/profile-pic.png")}
              alt="profile pic"
              className="icons"
            />
            <TextField
              required
              className="input-field"
              label="Profile Picture (URL)"
              margin="dense"
              variant="outlined"
              onChange={this.handleChange}
              type="text"
              name="profile_pic"
              placeholder="Profile Picture"
              value={this.state.profile_pic}
            />
          </div>
          <div className="signup-demo-buttons">
            <MuiThemeProvider theme={orange}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className="signup-button">
                Sign Up
              </Button>
            </MuiThemeProvider>
            <br />
            <MuiThemeProvider theme={blue}>
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                className="signup-button"
                onClick={this.clientDemoLogin}>
                Non-Profit Demo
              </Button>
            </MuiThemeProvider>
          </div>
        </form>
      );
    } else {
      return null;
    }
  };

  clientDemoLogin = e => {
    e.preventDefault();
    axios
      .post("/api/sessions/login/", {
        email: "clientdemo@test.com",
        password_digest: "1234"
      })
      .then(() => {
        Auth.authenticateUser("clientdemo@test.com");
      })
      .then(() => {
        this.props.checkAuthenticateStatus();
      })
      .then(() => {
        this.props.history.push("/feed");
      });
  };

  vendorDemoLogin = e => {
    e.preventDefault();
    axios
      .post("/api/sessions/login/", {
        email: "vendordemo@test.com",
        password_digest: "1234"
      })
      .then(() => {
        Auth.authenticateUser("vendordemo@test.com");
      })
      .then(async () => {
        await this.props.checkAuthenticateStatus();
      })
      .then(() => {
        this.props.history.push("/vendor/vendortester");
      });
  };

  conditionalRouting = () => {
    if (this.state.isSubmitted && this.props.currentUser.type === 1) {
      return <Redirect to={`/vendor/${this.props.currentUser.name}`} />;
    } else if (this.state.isSubmitted && this.props.currentUser.type === 2) {
      return <Redirect to={"/feed"} />;
    }
  };

  render() {
    return (
      <div id="signup-page">
        {this.conditionalRouting()}
        <h3 id="signup-header">Join Save A Plate!</h3>
        <div className="choose-user-signup-form">
          <FormControl component="fieldset">
            <FormLabel component="legend" className="user-type">
              <p id="signup-header-body">
                Are you a food vendor or non-profit organization?
              </p>
            </FormLabel>
            <RadioGroup
              aria-label="User Type"
              name="type"
              value={this.state.value}
              onClick={this.handleChange}
              className="radioGroupContainer">
              <FormControlLabel
                value="1"
                control={<Radio />}
                label={<Typography variant="h6">Food Vendor</Typography>}
                className="foodVendorRadioContainer"
              />
              <FormControlLabel
                value="2"
                control={<Radio />}
                label={
                  <Typography variant="h6">Non-profit Organization</Typography>
                }
                className="npoRadioContainer"
              />
            </RadioGroup>
          </FormControl>
        </div>
        <div className="signup-form-wrapper">{this.signUpForm()}</div>
      </div>
    );
  }
}

export default SignUp;
