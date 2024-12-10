import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import { MuiThemeProvider, createTheme } from "@material-ui/core/styles";
import "./feedCSS/AllFeedItemsDisplayed.css";
import { format } from "date-fns";

const theme = createTheme({
  palette: {
    primary: { 500: "#33443c" },
    secondary: {
      main: "#988686",
    },
  },
  typography: {
    useNextVariants: true,
  },
});

const formatDate = (isoString) => format(new Date(isoString), "MMMM dd, yyyy");
const formatTime = (isoString) => format(new Date(isoString), "hh:mm a");

class AllFeedItemsDisplayed extends Component {
  render() {
    const { foodDataObj, vendorId, fadeTrigger, claimItem, receivedOpenSnackbar } = this.props;

    const foodItems = Array.isArray(foodDataObj[vendorId]) ? foodDataObj[vendorId] : [];

    return (
      <div className="food-items-list">
        {foodItems.map((food, index) => {
          const isExpired = new Date(food.set_time) < new Date();
          return (
            <div
              className={`food-item ${fadeTrigger.includes(food.id) ? "fade-out" : ""}`}
              key={index}
            >
              <div className="food-item-info">
                <p className="food-name">{food.name}</p>
                <p className="food-quantity">{food.quantity} Kilograms</p>

                <p className="food-pickup">
                  {formatDate(food.set_time)} <br />
                  <span className="pickup-time">{formatTime(food.set_time)}</span>
                </p>
              </div>
              <div className="claim-button-container">
                <MuiThemeProvider theme={theme}>
                  <Button
                    variant="contained"
                    color={food.is_claimed ? "secondary" : "primary"}
                    className={`claim-button ${food.is_claimed ? "claimed" : ""}`}
                    disabled={isExpired}
                    onClick={(e) => {
                      if (isExpired) {
                        alert("Pickup time has passed. This item cannot be claimed.");
                        return;
                      }
                      claimItem(e, food.is_claimed, food.id);
                      receivedOpenSnackbar();
                    }}
                  >
                    {food.is_claimed ? "Unclaim" : "Claim"}
                  </Button>
                </MuiThemeProvider>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default AllFeedItemsDisplayed;
