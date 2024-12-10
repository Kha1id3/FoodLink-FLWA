import React from "react";
import "./feedCSS/SearchBarResultsVendorItemsDisplay.css";

const SearchBarResultsVendorItemsDisplay = ({ food, claimItem, receivedOpenSnackbar }) => {
  const formattedDate = new Date(food.set_time).toLocaleString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="search-item-card">
      <div className="search-item-details">
        <h3 className="search-item-name">{food.name}</h3>
        <p className="search-item-weight">{food.quantity} Kilograms</p>
        <p className="search-item-time">{formattedDate}</p>
      </div>
      <button
        className={`claim-button ${food.is_claimed ? "claimed" : "unclaimed"}`}
        onClick={(e) => {
          claimItem(e, food.is_claimed);
          receivedOpenSnackbar();
        }}
        id={food.id}
      >
        {food.is_claimed ? "UNCLAIM" : "CLAIM"}
      </button>
    </div>
  );
};

export default SearchBarResultsVendorItemsDisplay;
