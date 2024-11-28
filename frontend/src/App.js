import React, { Component } from "react";
import axios from "axios";
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
import VendorClaimedItemsContainer from "./containers/VendorClaimedItemsContainer";
import DonatePageContainer from "./containers/DonatePageContainer.js";
import MatchedItemsPage from "./components/matched-items/MatchedItemsPage.js";

class App extends Component {
  componentDidMount() {
    if (this.props.checkAuthenticateStatus) {
      this.props.checkAuthenticateStatus(); // Make sure checkAuthenticateStatus is passed in props
    }
  }

  render() {
    const { currentUser } = this.props;

    return (
      <div className="App">
        {/* Global Notifications Component */}
        <Notifications
          options={{
            zIndex: 200,
            bottom: "20px",
            wrapperClassName: "custom-notify-container",
          }}
        />

        {/* Render Navbar based on currentUser */}
        {currentUser && currentUser.email ? (
          <LoggedInNavBarContainer />
        ) : (
          <NavBar />
        )}

        <div className="main-section">
          <Switch>
            {/* Public Routes */}
            <Route exact path="/" component={Landing} />
            <Route exact path="/welcome" component={Landing} />
            <Route exact path="/aboutus" component={AboutUs} />
            <Route exact path="/resources" component={Resources} />
            <Route exact path="/map" component={Map} />
            <Route path="/user/signup" component={SignUpContainer} />
            <Route path="/user/login" component={LoginContainer} />
            <Route path="/claimed-items" component={ClaimedItemsPage} />

            {/* Private Routes */}
            <PrivateRoute
              exact
              path="/client/:client"
              component={ClientProfileContainer}
            />
            <PrivateRoute exact path="/matched-items" component={MatchedItemsPage} />
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
              path="/vendor_claimed_page"
              component={VendorClaimedItemsContainer}
            />
            <PrivateRoute exact path="/donate" component={DonatePageContainer} />

            {/* Route for Notification Mark Read */}
            <Route
              exact
              path="/api/notifications/:id/read"
              render={({ match }) => {
                const { id } = match.params;
                // Call the API to mark notification as read
                axios
                  .patch(`/api/notifications/${id}/read`)
                  .then((res) => {
                    console.log(`Notification ${id} marked as read:`, res.data);
                  })
                  .catch((err) => {
                    console.error(`Error marking notification ${id} as read:`, err);
                  });
                return null; // No UI needed for this route
              }}
            />
          </Switch>
        </div>
      </div>
    );
  }
}

export default App;
