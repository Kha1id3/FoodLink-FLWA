import React, { Component } from "react";
import axios from "axios";
import { Redirect, Link } from "react-router-dom";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Auth from "../../utils/Auth.js";
import { notify } from "react-notify-toast"; // Import the notify package
import "./authCSS/Login.css";

class Login extends Component {
  state = {
    email: "",
    password_digest: "",
    isSubmitted: false,
    errorMessage: "" // Add an error message state
  };

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  loginUser = async (e) => {
    e.preventDefault();
    const { email, password_digest } = this.state;
  
    try {
      const response = await axios.post("/api/sessions/login/", { email, password_digest });
      Auth.authenticateUser(email);
      this.props.checkAuthenticateStatus();
      this.setState({
        email: "",
        password_digest: "",
        isSubmitted: true,
      });
    } catch (error) {
      // Handle different error responses
      if (error.response && error.response.status === 401) {
        // Invalid email or password
        this.setState({ errorMessage: "Invalid email or password." });
      } else {
        // Internal server error or other issues
        this.setState({ errorMessage: "An internal server error occurred." });
      }
    }
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
      <div className="loginWrapper">
        {this.conditionalRouting()}
        <form onSubmit={this.loginUser} id="login-form">
          <h1 id="login-header">Login</h1>
          {this.state.errorMessage && (
            <div className="error-message">
              🍗 Oops!🥪<br />
              <strong>{this.state.errorMessage}</strong>. 
            </div>
          )}
          <div id="login-email">
            <img
              src={require("./icons/email.png")}
              alt="email"
              className="icons"
              id="login-email-icon"
            />
            <TextField
              required
              type="text"
              id="email-input"
              label="Email"
              value={this.state.email}
              name="email"
              onChange={this.handleChange}
              placeholder="Email"
            />
          </div>
          <div id="login-password">
            <img
              src={require("./icons/password.png")}
              alt="password"
              className="icons"
              id="login-password-icon"
            />
            <TextField
              required
              type="password"
              id="password-input"
              label="Password"
              value={this.state.password_digest}
              name="password_digest"
              onChange={this.handleChange}
              placeholder="Password"
            />
          </div>
          <br />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className="login-button"
          >
            Login
          </Button>
          <div className="notMemberDiv">
            <p>Don't have an account?</p>
            <p>
              <Link to="/user/signup" id="signup-link">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    );
  }
}

export default Login;
