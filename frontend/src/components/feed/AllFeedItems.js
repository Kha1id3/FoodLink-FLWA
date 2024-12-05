import React, { Component } from "react";
import AllFeedItemsDisplayed from "./AllFeedItemsDisplayed.js";
import AllFeedItemsDisplayVendorName from "./AllFeedItemsDisplayVendorName.js";
import "./feedCSS/AllFeedItems.css";

class AllFeedItems extends Component {
  constructor() {
    super();
    this.state = {
      pictureObj: []
    };
  }

  allVendorsMapped = (foodDataObj) => {
    if (!foodDataObj || !this.props.allVendors) return {};
  
    let newObj = {};
  
    Object.keys(foodDataObj).forEach((vendorId) => {
      const vendorName = foodDataObj[vendorId][0]?.vendor_name; // Ensure vendor_name exists
      if (vendorName && this.props.allVendors[vendorName]) {
        newObj[vendorName] = this.props.allVendors[vendorName]; // Map vendorName to its profile picture
      }
    });
  
    return newObj;
  };

  allFoodItemsMapped = () => {
    const { allFoodItems } = this.props;
  
    if (!allFoodItems || typeof allFoodItems !== "object") {
      console.error("allFoodItems is not an object:", allFoodItems);
      return null;
    }
  
    const vendorIds = Object.keys(allFoodItems);
  
    return vendorIds.map((vendorId, i) => {
      const { vendorName, items } = allFoodItems[vendorId];
      return (
        <div key={i}>
          <AllFeedItemsDisplayVendorName
            vendorName={vendorName}
            vendorId={vendorId}
            foodDataObj={{ [vendorId]: items }}
            allVendors={this.props.allVendors}
          />
          <AllFeedItemsDisplayed
            foodDataObj={{ [vendorId]: items }}
            claimItem={this.props.claimItem}
            vendorId={vendorId}
            receivedOpenSnackbar={this.props.receivedOpenSnackbar}
            fadeTrigger={this.props.fadeTrigger}
          />
        </div>
      );
    });
  };

  render() {
    return <>{this.allFoodItemsMapped()}</>;
  }
}

export default AllFeedItems;
