import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import { MuiThemeProvider, createTheme } from "@material-ui/core/styles";
import "./feedCSS/AllFeedItemsDisplayed.css";
import { format } from 'date-fns';

const theme = createTheme({
  palette: {
    primary: { 500: "#D35348" },
    secondary: {
      main: "#988686"
    }
  },
  typography: {
    useNextVariants: true
  }
});

const formatDate = (isoString) => {
  return format(new Date(isoString), 'MMMM dd, yyyy'); // Example: "November 22, 2024"
};

const formatTime = (isoString) => {
  return format(new Date(isoString), 'hh:mm a'); // Example: "08:30 PM"
};

class AllFeedItemsDisplayed extends Component {
  render() {
    return (
      <div className="vendor-items-wrapper">
        <div className="search-items-results-header">
          <h4 className="vendor-item-name">Food Item</h4>
          <h4 className="vendor-weight">Weight</h4>
          <h4 className="vendor-feeds">Feeds</h4>
          <h4 className="vendor-pick-up">Pick-Up Time</h4>
          <div className="vendor-spacing" />
        </div>
        {this.props.foodDataObj[this.props.vendorName].map((food, index) => {
          const isExpired = new Date(food.set_time) < new Date();
          return (
            <div
              className={
                this.props.fadeTrigger.includes(food.id)
                  ? "vendor-items-container fade-out"
                  : "vendor-profile-container-vendor-version"
              }
              key={index}
            >
              <div className="display-claimed-items-for-client">
                <div id="item-name-container">
                  <p>{food.name}</p>
                </div>
                <div id="item-weight-container">
                  <p>{food.quantity * 3} Kilograms</p>
                </div>
                <div id="item-feeds-container">
                  <p>{food.quantity} people</p>
                </div>
                <div id="item-pickup-container">
                  <p className="pickup-date">{formatDate(food.set_time)}</p>
                  <p className="pickup-time">{formatTime(food.set_time)}</p>
                </div>
                <span
                  id={food.id}
                  className="span-claim-button"
                  onClick={(e) => {
                    if (isExpired) {
                      alert("Pickup time has passed. This item cannot be claimed.");
                      return;
                    }
                    this.props.claimItem(e, food.is_claimed, food.id);
                    this.props.receivedOpenSnackbar();
                  }}
                >
                  <MuiThemeProvider theme={theme}>
                    <Button
                      variant="contained"
                      color="secondary"
                      className={
                        food.is_claimed || isExpired
                          ? "claimed-button"
                          : "unclaimed-button"
                      }
                      disabled={isExpired}
                    >
                      {food.is_claimed ? "Unclaim" : "Claim"}
                    </Button>
                  </MuiThemeProvider>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default AllFeedItemsDisplayed;
