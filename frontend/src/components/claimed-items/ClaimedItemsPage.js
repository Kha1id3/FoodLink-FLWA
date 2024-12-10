import React, { Component } from "react";
import axios from "axios";
import "../profiles/clientProfiles/clientProfileCSS/ClientClaimedItems.css";
import { notify } from "react-notify-toast";
import { format } from "date-fns";

// Formatting functions
const formatDate = (isoString) => {
  if (!isoString) return "N/A";
  try {
    return format(new Date(isoString), "MMMM dd, yyyy");
  } catch (error) {
    return "Invalid Date";
  }
};

const formatTime = (isoString) => {
  if (!isoString) return "N/A";
  try {
    return format(new Date(isoString), "hh:mm a");
  } catch (error) {
    return "Invalid Time";
  }
};

class ClaimedItemsPage extends Component {
  state = {
    claimedFoodItems: [],
    vendors: {}, // Map of vendorId -> vendor details
    slideProgress: {},
    openDropdowns: {},
    slidingItem: null,
    isMouseDown: false,
  };

  componentDidMount() {
    this.getAllClaimedFoodItems();
    this.getAllVendors(); // Fetch vendor details
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
        // Map vendors by ID for easy lookup
        const vendors = res.data.vendors.reduce((acc, vendor) => {
          acc[vendor.id] = vendor;
          return acc;
        }, {});
        this.setState({ vendors });
      })
      .catch((err) => console.error(err));
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

  handleConfirmPickup = (itemId) => {
    axios
      .patch(`/api/fooditems/confirmpickup/${itemId}`)
      .then(() => {
        notify.show("Pickup confirmed successfully!", "success", 3000);
        this.setState((prevState) => ({
          claimedFoodItems: prevState.claimedFoodItems.filter(
            (item) => item.id !== itemId
          ),
        }));
      })
      .catch(() => notify.show("Failed to confirm pickup.", "error", 3000));
  };

  toggleDropdown = (itemId) => {
    this.setState((prevState) => ({
      openDropdowns: {
        ...prevState.openDropdowns,
        [itemId]: !prevState.openDropdowns[itemId],
      },
    }));
  };

  render() {
    const { claimedFoodItems, vendors, slideProgress, openDropdowns } = this.state;

    return (
      <div className="claimed-items-page">
        <h1 className="page-title">Claimed Food Items</h1>
        <div className="claimed-items-grid">
          {claimedFoodItems.map((item) => {
            const vendor = vendors[item.vendor_id]; // Lookup vendor details

            return (
              <div key={item.id} className="claimed-item-card">
                {/* Vendor Section */}
                {vendor && (
                  <div className="vendor-section">
                    <img
                      src={vendor.profile_picture}
                      alt={vendor.name}
                      className="vendor-profile-pic"
                    />
                    <h4 className="vendor-name">{vendor.name}</h4>
                  </div>
                )}

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
                  </div>
                  <div
                    className="slider-container"
                    onMouseMove={(e) => this.handleMouseMove(e, item.id)}
                    onMouseUp={() => this.handleMouseUp(item.id)}
                    onMouseLeave={() => this.handleMouseUp(item.id)}
                  >
                    <div
                      className="slider"
                      onMouseDown={() => this.handleMouseDown(item.id)}
                      style={{
                        left: `${(slideProgress[item.id] || 0) * 100}%`,
                        backgroundColor:
                          slideProgress[item.id] >= 0.5 ? "#4caf50" : "#ccc",
                      }}
                    />
                  </div>
                  <button
                    className="details-button"
                    onClick={() => this.toggleDropdown(item.id)}
                  >
                    {openDropdowns[item.id] ? "Hide Details" : "View Details"}
                  </button>
                </div>
                {openDropdowns[item.id] && (
                  <div className="card-footer">
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
          })}
        </div>
      </div>
    );
  }
}

export default ClaimedItemsPage;
