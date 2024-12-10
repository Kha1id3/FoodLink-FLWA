import React, { Component } from "react";
import AllFeedItemsDisplayed from "./AllFeedItemsDisplayed.js";
import AllFeedItemsDisplayVendorName from "./AllFeedItemsDisplayVendorName.js";
import "./feedCSS/AllFeedItems.css";

class AllFeedItems extends Component {
  constructor() {
    super();
    this.state = {
      pictureObj: [], // Holds vendor profile pictures
    };
  }

  /**
   * Maps all vendors and ensures that the profile pictures
   * are fetched and displayed properly.
   */
  allVendorsMapped = (foodDataObj) => {
    if (!foodDataObj || !this.props.allVendors) return {};

    let mappedVendors = {};

    Object.keys(foodDataObj).forEach((vendorId) => {
      const vendorName = foodDataObj[vendorId][0]?.vendor_name; // Ensure vendor_name exists
      if (vendorName && this.props.allVendors[vendorName]) {
        mappedVendors[vendorName] = this.props.allVendors[vendorName]; // Map vendorName to its profile picture
      }
    });

    return mappedVendors;
  };

  /**
   * Maps all food items grouped by vendors and displays
   * their corresponding vendor and food details.
   */
  allFoodItemsMapped = () => {
    const { allFoodItems } = this.props;
  
    if (!allFoodItems || typeof allFoodItems !== "object") {
      console.error("allFoodItems is not an object:", allFoodItems);
      return null;
    }
  
    const vendorIds = Object.keys(allFoodItems);
  
    return (
      <div className="all-vendors-grid">
        {vendorIds.map((vendorId, i) => {
          const vendorData = allFoodItems[vendorId];
  
          if (!vendorData.items || vendorData.items.length === 0) {
            return null; // Skip this vendor if no items are left
          }
  
          const { vendorName, vendorAddress, vendorProfilePic, items } = vendorData;
  
          return (
            <div key={i} className="vendor-card">
              {/* Vendor Information */}
              <AllFeedItemsDisplayVendorName
                vendorName={vendorName}
                vendorId={vendorId}
                vendorProfilePic={vendorProfilePic} // Tie profile pic to vendor ID
                vendorAddress={vendorAddress}
                foodDataObj={{ [vendorId]: items }}
                allVendors={this.props.allVendors}
              />
  
              {/* Food Items */}
              <AllFeedItemsDisplayed
                foodDataObj={{ [vendorId]: items }}
                claimItem={this.props.claimItem}
                vendorId={vendorId}
                receivedOpenSnackbar={this.props.receivedOpenSnackbar}
                fadeTrigger={this.props.fadeTrigger}
              />
            </div>
          );
        })}
      </div>
    );
  };

  render() {
    return <>{this.allFoodItemsMapped()}</>;
  }
}

export default AllFeedItems;
