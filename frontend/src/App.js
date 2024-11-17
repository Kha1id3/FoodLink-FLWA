import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import Notifications from "react-notify-toast"; // Import Notifications
import LoginContainer from "./containers/LoginContainer.js";
import SignUpContainer from "./containers/SignUpContainer.js";
import "./App.css";
import NavBar from "./components/navBar/NavBar.js";
import Landing from "./components/landing/Landing.js";
import AboutUs from "./components/navBar/navComponents/aboutUs/AboutUs.js";
import Resources from "./components/navBar/navComponents/resources/Resources.js";
import Map from "./components/navBar/navComponents/map/Map.js";
import ClientProfileContainer from "./containers/ClientProfileContainer.js";
import VendorProfileContainer from "./containers/VendorProfileContainer.js";
import FeedContainer from "./containers/FeedContainer.js";
import VendorProfileThruClientContainer from "./containers/VendorProfileThruClientContainer";
import LoggedInNavBarContainer from "./containers/LoggedInNavBarContainer.js";
import PrivateRoute from "./utils/AuthRouting.js";
import ClaimedItemsPage from "./components/claimed-items/ClaimedItemsPage.js";
import VendorClaimedItemsPage from "./components/vendor_claimed_profile/VendorClaimedItemsPage.js";
import VendorClaimedItemsContainer from "./containers/VendorClaimedItemsContainer";

class App extends Component {
  componentDidMount() {
    this.props.checkAuthenticateStatus();
  }

  render() {
    return (
      <div className="App">
        {/* Global Notifications Component */}
        <Notifications options={{ zIndex: 200, bottom: '20px', wrapperClassName: 'custom-notify-container' }} />
        {this.props.currentUser.email === null ? (
          <NavBar />
        ) : (
          <LoggedInNavBarContainer />
        )}
        <div className="main-section">
          <Switch>
            <Route exact={true} path="/" component={Landing} />
            <Route exact path="/welcome" component={Landing} />
            <Route exact path="/aboutus" component={AboutUs} />
            <Route exact path="/resources" component={Resources} />
            <Route exact path="/map" component={Map} />
            <Route path="/user/signup" component={SignUpContainer} />
            <Route path="/user/login" component={LoginContainer} />
            <Route path="/claimed-items" component={ClaimedItemsPage} />
            <PrivateRoute
              exact
              path="/client/:client"
              component={ClientProfileContainer}
            />
            <PrivateRoute
              exact
              path="/vendor/:vendor"
              component={VendorProfileContainer}
            />
            <PrivateRoute exact path="/feed" component={FeedContainer} />
            <PrivateRoute
              exact
              path="/clientview/:vendor"
              component={VendorProfileThruClientContainer}
            />
            <PrivateRoute
              exact
              path="/claimed-items"
              component={ClaimedItemsPage}
            />

            <PrivateRoute
              exact
              path="/vendor_claimed_profile"
              component={VendorClaimedItemsContainer}
            />
          </Switch>
        </div>
      </div>
    );
  }
}

export default App;
