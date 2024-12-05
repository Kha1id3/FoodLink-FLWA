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
    if (!foodDataObj || !this.props.allVendors) return null;
    let newObj = {};
  
    Object.keys(foodDataObj).forEach((vendorName) => {
      foodDataObj[vendorName].forEach((vendor) => {
        const profilePicture = this.props.allVendors[vendorName]; // Get the profile picture by vendor name
        if (profilePicture) {
          newObj[vendor.address_field] = profilePicture;
        }
      });
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
            profilePicture={this.allVendorsMapped({ [vendorId]: items })}
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
