import React, { Component } from "react";
import axios from "axios";
import "../profiles/clientProfiles/clientProfileCSS/ClientClaimedItems.css";
import { notify } from "react-notify-toast";
class ClaimedItemsPage extends Component {
  constructor() {
    super();
    this.state = {
      claimedFoodItems: [],
      allVendors: [],
    };
  }

  componentDidMount() {
    this.getAllClaimedFoodItems();
    this.getAllVendors();
  }

  getAllClaimedFoodItems = () => {
    axios
      .get("/api/fooditems/client/")
      .then((res) => {
        this.setState({ claimedFoodItems: res.data.food_items });
      })
      .catch((err) => console.error(err));
  };

  getAllVendors = () => {
    axios
      .get("/api/users/vendors/")
      .then((res) => {
        this.setState({ allVendors: res.data.vendors });
      })
      .catch((err) => console.error(err));
  };

  handleConfirmPickup = (itemId) => {
    axios
      .patch(`/api/fooditems/confirmpickup/${itemId}`)
      .then(() => {
        notify.show("Pickup confirmed successfully!", "success", 3000);
        this.setState((prevState) => ({
          claimedFoodItems: prevState.claimedFoodItems.filter(
            (item) => item.food_id !== itemId
          ),
        }));
      })
      .catch((err) => {
        notify.show("Failed to confirm pickup. Please try again.", "error", 3000);
        console.error(err);
      });
  };

  handleUnclaim = (itemId) => {
    axios
      .patch(`/api/fooditems/claimstatus/${itemId}`, {
        client_id: null,
        is_claimed: false,
      })
      .then(() => {
        // Show success notification
        notify.show("Item unclaimed successfully!", "success", 3000);
        this.getAllClaimedFoodItems(); // Refresh the list
      })
      .catch((err) => {
        console.error(err);
        // Show error notification
        notify.show("Failed to unclaim item. Please try again.", "error", 3000);
      });
  };

  organizeFoodItemsByVendor = () => {
    const { claimedFoodItems } = this.state;
    return claimedFoodItems.reduce((acc, item) => {
      if (!acc[item.vendor_name]) {
        acc[item.vendor_name] = [];
      }
      acc[item.vendor_name].push(item);
      return acc;
    }, {});
  };

  displayVendorAddressAndPhoto = (vendorName) => {
    const vendor = this.state.allVendors.find((v) => v.vendor_name === vendorName);
    if (vendor) {
      return (
        <>
          <div className="vendor-address-field">
            <p className="address-text">{vendor.address_field}</p>
          </div>
          <div className="clientImageWrapperForClientDisplay">
            <img
              className="client-claimed-items-profile-pic"
              src={vendor.profile_picture}
              alt={`${vendorName} profile`}
            />
          </div>
        </>
      );
    }
    return null;
  };

  renderVendorSections = () => {
    const itemsByVendor = this.organizeFoodItemsByVendor();
    return Object.keys(itemsByVendor).map((vendorName, index) => {
      const vendorItems = itemsByVendor[vendorName];

      return (
        <div key={index} className="claimedListContainer">
          <div className="display-vendor-name">
            <span className="display-item-name-client">{vendorName}</span>
            {this.displayVendorAddressAndPhoto(vendorName)}
          </div>
          <div id="vendor-items-header-client">
            <h4 id="item-name">Food Item</h4>
            <h4 id="weight">Weight</h4>
            <h4 id="feeds">Feeds</h4>
            <h4 id="pick-up">Pick-Up Time</h4>
            <h4 id="actions">Actions</h4>
          </div>
          {vendorItems.map((item, idx) => (
            <div key={idx} className="display-vendor-items">
              <div id="item-name-container">
                <p>{item.name}</p>
              </div>
              <div id="item-weight-container">
                <p>{item.quantity * 3} pounds</p>
              </div>
              <div id="item-feeds-container">
                <p>{item.quantity} people</p>
              </div>
              <div id="item-pickup-container">
                <p>{item.set_time}</p>
              </div>
              <div id="item-actions-container">
                <button
                  className="unclaim-button"
                  onClick={() => this.handleUnclaim(item.id)}
                >
                  Unclaim
                </button>
                <button
                  className="confirm-button"
                  onClick={() => this.handleConfirmPickup(item.id)}
                >
                  Confirm Pickup
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    });
  };

  render() {
    return (
      <div>
        <h1 id="claimed-items-list-client">Claimed Food Items</h1>
        {this.renderVendorSections()}
      </div>
    );
  }
}

export default ClaimedItemsPage;
