import React, { Component } from "react";
import axios from "axios";
import "../profiles/clientProfiles/clientProfileCSS/ClientClaimedItems.css";
import { notify } from "react-notify-toast";
import Switch from "@material-ui/core/Switch";

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

  handleToggleConfirm = (itemId, isConfirmed) => {
    axios
      .patch(`/api/fooditems/confirmpickup/${itemId}`, {
        is_confirmed: !isConfirmed,
      })
      .then(() => {
        notify.show(
          `Pickup ${!isConfirmed ? "confirmed" : "unconfirmed"} successfully!`,
          "success",
          3000
        );
        this.getAllClaimedFoodItems();
      })
      .catch((err) => {
        notify.show("Failed to update confirmation status. Please try again.", "error", 3000);
        console.error(err);
      });
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
                <Switch
                  checked={item.is_confirmed}
                  onChange={() => this.handleToggleConfirm(item.id, item.is_confirmed)}
                  color="primary"
                  name="confirmSwitch"
                  inputProps={{ "aria-label": "confirmation toggle" }}
                />
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
