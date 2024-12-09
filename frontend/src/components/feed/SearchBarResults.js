import React, { useEffect, useState } from "react";
import SearchBarResultsVendorDisplay from "./SearchBarResultsVendorDisplay";
import SearchBarResultsVendorItemsDisplay from "./SearchBarResultsVendorItemsDisplay";
import axios from "axios";
import "./feedCSS/SearchBarResults.css";

export const SearchBarResults = ({ userSearchResults, claimItem, receivedOpenSnackbar }) => {
  const groupedResults = userSearchResults.reduce((acc, item) => {
    const vendorId = item.vendor_id;
    const vendorName = item.vendor_name;

    if (!acc[vendorId]) {
      acc[vendorId] = {
        vendorName,
        vendorId,
        items: [],
      };
    }
    acc[vendorId].items.push(item);
    return acc;
  }, {});

  return (
    <div className="search-results-wrapper">
      {Object.values(groupedResults).map((vendor) => (
        <div key={vendor.vendorId} className="vendor-results-group">
          <SearchBarResultsVendorDisplay
            vendorName={vendor.vendorName}
            vendorId={vendor.vendorId} // Pass vendorId to fetch details
          />
          <div className="vendor-items-wrapper">
            {vendor.items.map((foodItem) => (
              <SearchBarResultsVendorItemsDisplay
                key={foodItem.id}
                food={foodItem}
                claimItem={claimItem}
                receivedOpenSnackbar={receivedOpenSnackbar}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
