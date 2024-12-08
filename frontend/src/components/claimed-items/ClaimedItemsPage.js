import React, { Component } from "react";
import axios from "axios";
import "../profiles/clientProfiles/clientProfileCSS/ClientClaimedItems.css";
import { notify } from "react-notify-toast";
import { format } from "date-fns";


// Formatting functions
const formatDate = (isoString) => {
  if (!isoString) return "N/A"; // Handle null or undefined dates
  try {
    return format(new Date(isoString), "MMMM dd, yyyy"); // Example: "November 22, 2024"
  } catch (error) {
    console.error("Error formatting date:", isoString, error);
    return "Invalid Date";
  }
};

const formatTime = (isoString) => {
  if (!isoString) return "N/A"; // Handle null or undefined times
  try {
    return format(new Date(isoString), "hh:mm a"); // Example: "08:30 PM"
  } catch (error) {
    console.error("Error formatting time:", isoString, error);
    return "Invalid Time";
  }
};


class ClaimedItemsPage extends Component {
  constructor() {
    super();
    this.state = {
      claimedFoodItems: [],
      allVendors: [],
      slidingItem: null,
      isMouseDown: false,
      slideProgress: {},
      openDropdowns: {}, // Track open dropdowns for each item
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
  
        // Remove the item from claimed items list
        this.setState((prevState) => ({
          claimedFoodItems: prevState.claimedFoodItems.filter(
            (item) => item.id !== itemId
          ),
        }));
  
        // Fetch new notifications to update the notification panel
        this.fetchNotifications();
      })
      .catch((err) => {
        notify.show("Failed to confirm pickup. Please try again.", "error", 3000);
        console.error("Error confirming pickup:", err);
      });
  };
  
  // Function to fetch updated notifications
  fetchNotifications = () => {
    axios
      .get(`/api/notifications/${this.props.currentUser.id}`)
      .then((res) => {
        this.setState({ notifications: res.data.notifications });
      })
      .catch((err) => console.error("Error fetching notifications:", err));
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

  renderVendorSections = () => {
    const itemsByVendor = this.organizeFoodItemsByVendor();
    const { slideProgress, openDropdowns } = this.state;

    return Object.keys(itemsByVendor).map((vendorName, index) => {
      const vendorItems = itemsByVendor[vendorName];

      return (
        <div key={index} className="claimedListContainer">
          <div id="vendor-items-header-client">
            <h4 id="item-name">Food Item</h4>
            <h4 id="weight">Weight</h4>
            <h4 id="feeds">Feeds</h4>
            <h4 id="pick-up">Pick-Up Time</h4>
            <h4 id="actions">Actions</h4>
          </div>
          {vendorItems.map((item, idx) => {
            const isDropdownOpen = openDropdowns[item.id];

            return (
              <div key={idx} className="display-vendor-items">
                <div id="item-name-container">
                  <p>{item.name}</p>
                </div>
                <div id="item-weight-container">
                  <p>{item.quantity * 3} Kilograms</p>
                </div>
                <div id="item-feeds-container">
                  <p>{item.quantity} people</p>
                </div>
                <div id="item-pickup-container">
                  <p className="pickup-date">{formatDate(item.set_time)}</p>
                  <p className="pickup-time">{formatTime(item.set_time)}</p>
                </div>
                <div id="item-actions-container">
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
                    {isDropdownOpen ? "Hide Details" : "View Details"}
                  </button>
                </div>
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
          })}
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
