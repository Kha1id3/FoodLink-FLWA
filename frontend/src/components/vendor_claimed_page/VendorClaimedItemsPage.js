import React, { Component } from "react";
import axios from "axios";
import { notify } from "react-notify-toast";
import { format } from "date-fns";
import "../profiles/clientProfiles/clientProfileCSS/ClientClaimedItems.css";

const formatDate = (isoString) => {
  return format(new Date(isoString), "MMMM dd, yyyy"); // Example: "November 22, 2024"
};

const formatTime = (isoString) => {
  return format(new Date(isoString), "hh:mm a"); // Example: "08:30 PM"
};

class VendorClaimedItemsPage extends Component {
  constructor() {
    super();
    this.state = {
      claimedFoodItems: [],
      slidingItem: null,
      isMouseDown: false,
      slideProgress: {},
      openDropdowns: {}, // Track open dropdowns for each item
    };
  }

  componentDidMount() {
    this.getClaimedFoodItemsByVendor();
  }

  getClaimedFoodItemsByVendor = () => {
    const { currentUser } = this.props;

    axios
      .get(`/api/fooditems/vendor/${currentUser.name}`)
      .then((res) => {
        const claimedItems = res.data.food_items.filter(
          (item) => item.is_claimed && !item.is_confirmed
        );
        this.setState({ claimedFoodItems: claimedItems });
      })
      .catch((err) => console.error("Error fetching claimed food items:", err));
  };

  toggleDropdown = (itemId) => {
    this.setState((prevState) => ({
      openDropdowns: {
        ...prevState.openDropdowns,
        [itemId]: !prevState.openDropdowns[itemId],
      },
    }));
  };

  handleConfirmPickup = (itemId) => {
    if (!itemId) {
      console.error("Invalid Item ID:", itemId);
      return;
    }

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
        console.error("Error confirming pickup:", err);
      });
  };

  handleMouseDown = (itemId) => {
    this.setState({ slidingItem: itemId, isMouseDown: true });
  };

  handleMouseMove = (e, itemId) => {
    if (!this.state.isMouseDown || this.state.slidingItem !== itemId) return;

    const slideContainer = e.target.closest(".slider-container");
    const containerRect = slideContainer.getBoundingClientRect();
    const progress = Math.min(
      Math.max((e.clientX - containerRect.left) / containerRect.width, 0),
      1
    );

    this.setState((prevState) => ({
      slideProgress: { ...prevState.slideProgress, [itemId]: progress },
    }));
  };

  handleMouseUp = (itemId) => {
    const progress = this.state.slideProgress[itemId] || 0;

    if (progress >= 0.95) {
      this.handleConfirmPickup(itemId);
    } else {
      this.setState((prevState) => ({
        slideProgress: { ...prevState.slideProgress, [itemId]: 0 },
      }));
    }

    this.setState({ slidingItem: null, isMouseDown: false });
  };

  renderClaimedItems = () => {
    const { claimedFoodItems, slideProgress, openDropdowns } = this.state;
  
    return claimedFoodItems.map((item, index) => {
      const isDropdownOpen = openDropdowns[item.food_id];
  
      return (
        <div key={index} className="display-vendor-items">
          {/* Food Item */}
          <div id="item-name-container">
            <p>{item.name}</p>
          </div>
  
          {/* Weight */}
          <div id="item-weight-container">
            <p>{item.quantity * 3} Kilograms</p>
          </div>
  
          {/* Feeds */}
          <div id="item-feeds-container">
            <p>{item.quantity} people</p>
          </div>
  
          {/* Pick-Up Time */}
          <div id="item-pickup-container">
            <p className="pickup-date">{formatDate(item.set_time)}</p>
            <p className="pickup-time">{formatTime(item.set_time)}</p>
          </div>
  
          {/* Actions (Slider + View Details) */}
          <div id="item-actions-container">
            <div
              className="slider-container"
              onMouseMove={(e) => this.handleMouseMove(e, item.food_id)}
              onMouseUp={() => this.handleMouseUp(item.food_id)}
              onMouseLeave={() => this.handleMouseUp(item.food_id)}
            >
              <div
                className="slider"
                onMouseDown={() => this.handleMouseDown(item.food_id)}
                style={{
                  left: `${(slideProgress[item.food_id] || 0) * 100}%`,
                  backgroundColor:
                    slideProgress[item.food_id] >= 0.95 ? "#4caf50" : "#ccc",
                }}
              />
            </div>
            <button
              className="details-button"
              onClick={() => this.toggleDropdown(item.food_id)}
            >
              {isDropdownOpen ? "Hide Details" : "View Details"}
            </button>
          </div>
  
          {/* Dropdown Content */}
          {isDropdownOpen && (
            <div className="vendor-pickup-code">
              <p>
                <strong>Pickup Code:</strong> {item.pickup_code || "N/A"}
              </p>
              <p>
                <strong>Comment:</strong> {item.comment || "No comments provided"}
              </p>
            </div>
          )}
        </div>
      );
    });
  };
  
  render() {
    return (
      <div>
        <h1 id="claimed-items-list-client">Claimed Food Items</h1>
        <div className="claimedListContainer">
          <div id="vendor-items-header-client">
            <h4 id="item-name">Food Item</h4>
            <h4 id="weight">Weight</h4>
            <h4 id="feeds">Feeds</h4>
            <h4 id="pick-up">Pick-Up Time</h4>
            <h4 id="actions">Actions</h4>
          </div>
          {this.renderClaimedItems()}
        </div>
      </div>
    );
  }
}

export default VendorClaimedItemsPage;
