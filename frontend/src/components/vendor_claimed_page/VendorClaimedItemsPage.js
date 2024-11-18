import React, { Component } from "react";
import axios from "axios";
import { notify } from "react-notify-toast";
import "./VendorClaimedItemsPage.css";

class VendorClaimedItemsPage extends Component {
  constructor() {
    super();
    this.state = {
      claimedFoodItems: [],
      slidingItem: null, // Track the current sliding item
      isMouseDown: false, // Track whether the mouse is pressed
      slideProgress: {}, // Track the progress of each slider
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
        const claimedItems = res.data.food_items.filter((item) => item.is_claimed);
        this.setState({ claimedFoodItems: claimedItems });
      })
      .catch((err) => console.error("Error fetching claimed food items:", err));
  };

  handleConfirmPickup = (itemId) => {
    axios
      .patch(`/api/fooditems/confirmpickup/${itemId}`)
      .then(() => {
        notify.show("Pickup confirmed successfully!", "success", 3000);
        this.setState((prevState) => ({
          claimedFoodItems: prevState.claimedFoodItems.map((item) =>
            item.food_id === itemId ? { ...item, is_confirmed: true } : item
          ),
          slideProgress: { ...prevState.slideProgress, [itemId]: 0 },
        }));
      })
      .catch((err) => {
        notify.show("Failed to confirm pickup. Please try again.", "error", 3000);
        console.error(err);
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
      // Confirm pickup if slider is fully slid to the right
      this.handleConfirmPickup(itemId);
    } else {
      // Reset slider if not fully slid
      this.setState((prevState) => ({
        slideProgress: { ...prevState.slideProgress, [itemId]: 0 },
      }));
    }

    this.setState({ slidingItem: null, isMouseDown: false });
  };

  renderClaimedItems = () => {
    const { claimedFoodItems, slideProgress } = this.state;

    return claimedFoodItems.map((item) => (
      <div
        key={item.food_id}
        className={`claimed-item-row ${item.is_confirmed ? "confirmed" : ""}`}
      >
        <div className="claimed-item-name">{item.name}</div>
        <div className="claimed-item-pounds">{item.quantity * 3} pounds</div>
        <div className="claimed-item-feeds">{item.quantity} people</div>
        <div className="claimed-item-time">{item.set_time}</div>
        <div className="claimed-item-actions">
          {item.is_confirmed ? (
            <span className="confirmation-message">Confirmed Pickup</span>
          ) : (
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
          )}
        </div>
      </div>
    ));
  };

  render() {
    return (
      <div className="vendor-claimed-items-container">
        <h1 className="vendor-claimed-items-title">Claimed Items</h1>
        <div className="claimed-items-header">
          <span>Item Name</span>
          <span>Weight</span>
          <span>Feeds</span>
          <span>Pickup Time</span>
          <span>Actions</span>
        </div>
        <div className="claimed-items-list">{this.renderClaimedItems()}</div>
      </div>
    );
  }
}

export default VendorClaimedItemsPage;
