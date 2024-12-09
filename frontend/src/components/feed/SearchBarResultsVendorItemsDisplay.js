import React from "react";
import { MuiThemeProvider } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import "./feedCSS/SearchBarResultsVendorItemsDisplay.css";

const SearchBarResultsVendorItemsDisplay = ({ food, claimItem, receivedOpenSnackbar }) => {
  const convertedTime = new Date(food.set_time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="search-items-wrapper">
      <div className="display-search-items-for-feed">
        <div id="search-item-name-container">
          <p>{food.name}</p>
        </div>
        <div id="search-item-weight-container">
          <p>{food.quantity * 3} Kilograms</p>
        </div>
        <div id="search-item-feeds-container">
          <p>{food.quantity} people</p>
        </div>
        <div id="search-item-pickup-container">
          <p>{convertedTime}</p>
        </div>
        <span
          className="span-claim-button"
          onClick={(e) => {
            claimItem(e, food.is_claimed);
            receivedOpenSnackbar();
          }}
        >
          <MuiThemeProvider>
            <Button
              id={food.id}
              variant="contained"
              color="secondary"
              onClick={(e) => {
                claimItem(e, food.is_claimed);
                receivedOpenSnackbar();
              }}
              className={food.is_claimed ? "claimed-button" : "unclaimed-button"}
            >
              {food.is_claimed ? "UNCLAIM" : "CLAIM"}
            </Button>
          </MuiThemeProvider>
        </span>
      </div>
    </div>
  );
};

export default SearchBarResultsVendorItemsDisplay;
