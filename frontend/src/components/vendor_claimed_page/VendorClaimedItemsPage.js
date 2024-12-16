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
      selectedItem: null, // For modal
    };
  }

  componentDidMount() {
    this.getClaimedFoodItemsByVendor();
  }

  getClaimedFoodItemsByVendor = () => {
    const vendorId = this.props.currentUser.id;
    axios
      .get(`/api/fooditems/vendor/id/${vendorId}`)
      .then((res) => {
        const claimedItems = res.data.food_items.filter(
          (item) => item.is_claimed && !item.is_confirmed
        );
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

  openDetailsModal = (item) => {
    this.setState({ selectedItem: item });
  };

  closeDetailsModal = () => {
    this.setState({ selectedItem: null });
  };

  renderClaimedItems = () => {
    const { claimedFoodItems, slideProgress } = this.state;

    return claimedFoodItems.map((item) => (
      <div key={item.food_id} className="claimed-item-card">
        {/* Food Details */}
        <div className="card-header">
          <h4 className="food-name">{item.name}</h4>
          <p className="pickup-time">
            {formatDate(item.set_time)} at {formatTime(item.set_time)}
          </p>
        </div>
        <div className="card-body">
          <div className="info-section">
            <p>
              <strong>Weight:</strong> {item.quantity} Kilograms
            </p>
            <p>
              <strong>Feeds:</strong> {item.quantity} people
            </p>
          </div>

          {/* Slider for Confirm Pickup */}
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

          {/* View Details Button */}
          <button
            className="details-button"
            onClick={() => this.openDetailsModal(item)}
          >
            View Details
          </button>
        </div>
      </div>
    ));
  };

  render() {
    const { claimedFoodItems, selectedItem } = this.state;

    return (
      <div className="claimed-items-page">
        <h1 className="page-title">Claimed Food Items</h1>

{claimedFoodItems.length === 0 ? (
  <div className="no-items-container">
    <img
      src="/images/empty-box.png" 
      alt="No items"
      className="no-items-image"
    />
    <h2 className="no-items-title">No Claimed Items Yet</h2>
    <p className="no-items-description">
      It looks like no one has claimed any food yet. Check back soon or explore the donations page!
    </p>
    <button className="refresh-button" onClick={this.getClaimedFoodItemsByVendor}>
      Refresh List
    </button>
  </div>
) : (
  <div className="claimed-items-grid">{this.renderClaimedItems()}</div>
)}

        {/* Modal Popup */}
        {selectedItem && (
  <div className="modal-overlay" onClick={this.closeDetailsModal}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h2>Pickup Details</h2>
      <p className="pickup-code">
        <strong>Pickup Code:</strong> {selectedItem.pickup_code || "N/A"}
      </p>
      <p className="comment">
        <strong>Comment:</strong> {selectedItem.comment || "No comments provided"}
      </p>
      <button className="close-button" onClick={this.closeDetailsModal}>
        Close
      </button>
    </div>
  </div>
        )}
      </div>
    );
  }
}

export default VendorClaimedItemsPage;
