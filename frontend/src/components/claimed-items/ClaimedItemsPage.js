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
    selectedItem: null, // Track selected item for the modal
  };

  componentDidMount() {
    this.getAllClaimedFoodItems();
  }

  getAllClaimedFoodItems = () => {
    axios
      .get("/api/fooditems/client/")
      .then((res) => {
        const claimedFoodItems = res.data.food_items || [];
        console.log("Claimed Food Items API Response:", claimedFoodItems);
  
        axios
          .get("/api/users/vendors/")
          .then((vendorRes) => {
            const vendors = vendorRes.data.vendors || [];
            console.log("Vendors API Response:", vendors);
  
            // Map vendors by ID
            const vendorMap = vendors.reduce((acc, vendor) => {
              acc[vendor.vendor_id] = {
                address: vendor.address_field || "Address not available",
                profilePicture: vendor.profile_picture || "loading.png",
                name: vendor.vendor_name || "Unknown Vendor",
              };
              return acc;
            }, {});
  
            console.log("Mapped Vendors Object:", vendorMap);
  
            // Map claimed food items to their vendors
            const itemsWithVendorDetails = claimedFoodItems.map((item) => {
              const vendorDetails = vendorMap[item.vendor_id] || {
                address: "Address not available",
                profilePicture: "default.png",
                name: "Unknown Vendor",
              };
              console.log(`Mapping Food Item (${item.name}):`, vendorDetails);
  
              return {
                ...item,
                vendorDetails,
              };
            });
  
            this.setState({ claimedFoodItems: itemsWithVendorDetails });
            console.log("Final Mapped Claimed Items:", itemsWithVendorDetails);
          })
          .catch((err) => console.error("Error fetching vendors:", err));
      })
      .catch((err) => console.error("Error fetching claimed food items:", err));
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

  openDetailsModal = (item) => {
    this.setState({ selectedItem: item });
  };

  closeDetailsModal = () => {
    this.setState({ selectedItem: null });
  };

  render() {
    const { claimedFoodItems, slideProgress, selectedItem } = this.state;


    return (
      <div className="claimed-items-page">
      <h1 className="page-title">Claimed Food Items</h1>

      {claimedFoodItems.length === 0 ? (
        <div className="no-items-container">
          <img
            src="/images/empty-box.png" // Placeholder for an illustration
            alt="No items"
            className="no-items-image"
          />
          <h2 className="no-items-title">No Claimed Items Yet</h2>
          <p className="no-items-description">
            It seems there are no claimed items. Claim your first donation today!
          </p>
          <button className="refresh-button" onClick={this.getAllClaimedFoodItems}>
            Refresh List
          </button>
        </div>
      ) : (
        <div className="claimed-items-grid">
          {claimedFoodItems.map((item) => (
            <div key={item.id} className="claimed-item-card">
              {/* Vendor Info */}
              <AllFeedItemsDisplayVendorName
                vendorId={item.vendor_id}
                vendorName={item.vendorDetails.name}
                vendorAddress={item.vendorDetails.address}
                vendorProfilePic={item.vendorDetails.profilePicture}
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
                  onClick={() => this.openDetailsModal(item)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
          </div>
      )}

        {/* Modal Popup for Pickup Code and Comments */}
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

export default ClaimedItemsPage;
