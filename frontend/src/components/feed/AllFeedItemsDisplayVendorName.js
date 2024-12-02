import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./feedCSS/AllFeedItemsDisplayVendorName.css";

class AllFeedItemsDisplayVendorName extends Component {
  displayVendorPhoto = (newArr) => {
    if (this.props.profilePicture && this.props.profilePicture[newArr[0]]) {
      return (
        <img
          className="feed-profile-pic"
          src={this.props.profilePicture[newArr[0]]}
          alt="Vendor Profile"
        />
      );
    }
    return null;
  };

  getAllAddress = (foodDataObj, vendorName) => {
    let newArr = [];
    if (foodDataObj[vendorName].length > 1) {
      foodDataObj[vendorName].forEach((name) => {
        newArr.push(foodDataObj[vendorName][0].address_field);
        newArr.slice(0, 0);
      });
    } else {
      foodDataObj[vendorName].forEach((name) => {
        newArr.push(name.address_field);
      });
    }

    const address = newArr[0];

    return (
      <>
        <div className="vendor-address-field">
          <Link
            to={`/map?address=${encodeURIComponent(address)}`}
            className="address-link"
          >
            <p className="address-text">{address}</p>
          </Link>
        </div>
        <div className="vendor-account-profile-pic">
          {this.displayVendorPhoto(newArr)}
        </div>
      </>
    );
  };

  render() {
    return (
      <div className="display-vendor-name-feed">
        <span className="vendor-span-container">
          <Link
            to={`/clientview/${this.props.vendorName}`}
            className="display-item-name"
          >
            {this.props.vendorName}
          </Link>
          {this.getAllAddress(this.props.foodDataObj, this.props.vendorName)}
        </span>
      </div>
    );
  }
}

export default AllFeedItemsDisplayVendorName;
