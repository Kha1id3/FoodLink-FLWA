import React, { Component } from "react";
import axios from "axios";
import { notify } from "react-notify-toast";
import { format } from "date-fns";
import AllFeedItemsDisplayVendorName from "./AllFeedItemsDisplayVendorName"; // Import component
import "../profiles/clientProfiles/clientProfileCSS/ClientClaimedItems.css";

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
    slideProgress: {},
    openDropdowns: {},
    slidingItem: null,
    isMouseDown: false,
  };

  componentDidMount() {
    this.getAllClaimedFoodItems();
  }

  getAllClaimedFoodItems = () => {
    axios
      .get("/api/fooditems/client/") // Fetch claimed food items
      .then((res) => {
        const claimedFoodItems = res.data.food_items || [];
  
        // Fetch vendor details
        axios
          .get("/api/users/vendors/") // Fetch vendors
          .then((vendorRes) => {
            const vendors = vendorRes.data.vendors.reduce((acc, vendor) => {
              acc[vendor.id] = {
                address: vendor.address_field || "Address not available",
                profilePicture: vendor.profile_picture || "default.png",
                name: vendor.name || "Unknown Vendor",
              };
              return acc;
            }, {});
  
            // Enhance each claimed item with vendor details
            const itemsWithVendorDetails = claimedFoodItems.map((item) => ({
              ...item,
              vendorDetails: vendors[item.vendor_id] || {
                address: "Address not available",
                profilePicture: "default.png",
                name: "Unknown Vendor",
              },
            }));
  
            this.setState({ claimedFoodItems: itemsWithVendorDetails });
          })
          .catch((err) => console.error("Error fetching vendors:", err));
      })
      .catch((err) => console.error("Error fetching claimed items:", err));
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
    const { claimedFoodItems, slideProgress, openDropdowns } = this.state;

    return (
      <div className="claimed-items-page">
        <h1 className="page-title">Claimed Food Items</h1>
        <div className="claimed-items-grid">
          {claimedFoodItems.map((item) => (
            <div key={item.id} className="claimed-item-card">
              {/* Vendor Info */}
              <AllFeedItemsDisplayVendorName
                vendorId={item.vendor_id}
                vendorName={item.vendor_name}
                vendorAddress={item.address_field}
              />

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
          ))}
        </div>
      </div>
    );
  }
}

export default ClaimedItemsPage;
