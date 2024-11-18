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

  allVendorsMapped = foodDataObj => {
    if (!foodDataObj) return null;
    let newObj = {};
    let vendorNameArr = Object.keys(foodDataObj);
    vendorNameArr.forEach((vendorName, i) => {
      foodDataObj[vendorName].forEach(vendor => {
        this.props.allVendors.forEach(pics => {
          if (vendor.vendor_id === pics.vendor_id) {
            newObj[vendor.address_field] = pics.profile_picture;
          }
        });
      });
    });

    return newObj;
  };

  allFoodItemsMapped = () => {
    if (this.props.allFoodItems) {
      let foodDataObj = {};
      let converted_time;
      // Map over the food items and only include those that are not claimed and not confirmed
      this.props.allFoodItems.forEach((food) => {
        if (!food.is_claimed && !food.is_confirmed) {
          if (!foodDataObj[food.vendor_name]) {
            foodDataObj[food.vendor_name] = [food];
          } else {
            foodDataObj[food.vendor_name].push(food);
          }
        }
      });

      let vendorNameArr = Object.keys(foodDataObj);

      let vendorName = vendorNameArr.map((vendorName, i) => {
        return (
          <div key={i}>
            <AllFeedItemsDisplayVendorName
              vendorName={vendorName}
              foodDataObj={foodDataObj}
              profilePicture={this.allVendorsMapped(foodDataObj)}
            />
            <AllFeedItemsDisplayed
              foodDataObj={foodDataObj}
              claimItem={this.props.claimItem}
              vendorName={vendorName}
              receivedOpenSnackbar={this.props.receivedOpenSnackbar}
              fadeTrigger={this.props.fadeTrigger}
            />
          </div>
        );
      });
      return vendorName;
    }
  };

  render() {
    return <>{this.allFoodItemsMapped()}</>;
  }
}

export default AllFeedItems;
