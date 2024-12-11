import React, { Component } from "react";
import axios from "axios";
import Button from "@material-ui/core/Button";
import { MuiThemeProvider, createTheme } from "@material-ui/core/styles";
import CountUp from "react-countup";
import MainSnackbarContainer from "../../containers/MainSnackbarContainer.js";
import SimpleModal from "./SimpleModal.js";
import "./vendorProfilesCSS/VendorProfile.css";
import { format } from "date-fns";

const theme = createTheme({
  palette: {
    primary: { 500: "#5C4E4E" },
    secondary: {
      main: "#5C4E4E",
    },
  },
  typography: {
    useNextVariants: true,
  },
});

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

class DonatePage extends Component {
  constructor() {
    super();
    this.state = {
      quantity: "",
      name: "",
      set_time: "",
      comment: "",
      toAddItem: false,
      hasAdded: false,
      foodItems: [],
      fedCount: 0,
      profilePic: "",
      phoneNumber: "",
      body: "",
      open: false, // for modal
      openDropdowns: {},
      categories: [], // Add state for categories
      selectedItem: null, // For popup
      openPopup: false, // Popup state
    };
  }

  openDetailsModal = (item) => {
    this.setState({ selectedItem: item });
  };
  
  closeDetailsModal = () => {
    this.setState({ selectedItem: null });
  };


  toggleDropdown = (itemId) => {
    this.setState((prevState) => ({
      openDropdowns: {
        ...prevState.openDropdowns,
        [itemId]: !prevState.openDropdowns[itemId],
      },
    }));
  };

  componentDidMount() {
    if (this.props.currentUser) {
      this.fetchFoodItems();
      this.getFeedingCount();
      this.fetchCategories();
    } else {
      console.error("Current User is not defined.");
    }
  }

  fetchCategories = () => {
    axios
      .get("/api/categories") // Adjust the route if necessary
      .then((res) => {
        this.setState({ categories: res.data.categories });
      })
      .catch((err) => console.error("Error fetching categories:", err));
  };



  fetchFoodItems = () => {
    const vendorId = this.props.currentUser.id; // Use vendor ID
    axios
      .get(`/api/fooditems/vendor/id/${vendorId}`) // Updated route
      .then((res) => {
        const foodItems = res.data.food_items || []; // Ensure food_items is an array
        const sortedItems = foodItems.sort((a, b) => {
          if (!a.is_claimed && !a.is_confirmed) return -1;
          if (!b.is_claimed && !b.is_confirmed) return 1;
          if (a.is_claimed && !a.is_confirmed) return -1;
          if (b.is_claimed && !b.is_confirmed) return 1;
          if (a.is_confirmed) return 1;
          if (b.is_confirmed) return -1;
          return 0;
        });
        this.setState({ foodItems: sortedItems });
      })
      .catch((err) => {
        console.error("Error fetching food items:", err);
      });
  };

  getFeedingCount = () => {
    axios.get("/api/fooditems/feedingcount").then((count) => {
      this.setState({
        fedCount: +count.data.fedCount[0]?.sum * 3 || 0,
      });
    });
  };

  addItemButton = () => {
    return (
      <MuiThemeProvider theme={theme}>
        <Button
          variant="contained"
          color="primary"
          className="add-item-button"
          onClick={() => {
            this.toAddItem();
            this.handleOpen();
          }}
        >
          <div className="add-item-text"> Add Item</div>
        </Button>
      </MuiThemeProvider>
    );
  };

  toAddItem = () => {
    this.setState({
      toAddItem: !this.state.toAddItem,
    });
  };

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  submitItem = (e) => {
    e.preventDefault();
    this.setState({ hasAdded: true });
  
    const { quantity, name, set_time, comment, category_id } = this.state;
    axios
      .post("/api/fooditems/", {
        quantity,
        name,
        set_time,
        vendor_id: this.props.currentUser.id,
        comment,
        category_id,
        type: "donation",
      })
      .then(() => {
        this.setState({ toAddItem: false });
        this.fetchFoodItems();
  
        // Handle Notifications
        axios
          .get(`/api/notifications/${this.props.currentUser.id}`)
          .then((res) => {
            if (this.props.setNotifications) {
              this.props.setNotifications(res.data.notifications);
            }
          })
          .catch((err) => console.error("Error refreshing notifications:", err));
      })
      .catch((err) => {
        console.error("Error adding food item:", err);
      });
  };
  

  deleteItem = (e) => {
    axios
      .delete(`/api/fooditems/${e.currentTarget.id}`)
      .then(() => {
        this.fetchFoodItems();
      })
      .then(() => {
        this.getFeedingCount();
      });
  };

  handleOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false, toAddItem: !this.state.toAddItem });
  };

  displayFoodItems = () => {
    return (
      <div className="food-items-grid">
        {this.state.foodItems.map((item) => {
          const statusClasses = {
            "Claim Pending": "status-claim-pending",
            "Pickup Pending": "status-pickup-pending",
            "Pickup Confirmed": "status-pickup-confirmed",
          };
  
          let status;
          if (!item.is_claimed && !item.is_confirmed) {
            status = "Claim Pending";
          } else if (item.is_claimed && !item.is_confirmed) {
            status = "Pickup Pending";
          } else {
            status = "Pickup Confirmed";
          }
  
          const isDropdownOpen = this.state.openDropdowns[item.food_id];
  
          return (
            <div key={item.food_id} className="donation-card">
              {/* Item Info */}
              <div className="donation-card-header">
                <div className="donation-card-title">
                  {item.name}
                  {!item.is_claimed && !item.is_confirmed && (
                    <button
                      className="delete-item-button"
                      id={item.food_id}
                      onClick={this.deleteItem}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p className="donation-card-quantity">
                  Quantity: {item.quantity} Kg
                </p>
              </div>
  
              {/* Status */}
              <div className={`donation-card-status ${statusClasses[status]}`}>
                {status}
              </div>
  
              {/* Pickup Time */}
              <div className="donation-card-time">
                <p>
                  <strong>Date:</strong> {formatDate(item.set_time)}
                </p>
                <p>
                  <strong>Time:</strong> {formatTime(item.set_time)}
                </p>
              </div>
  
              {/* Details */}
              <button
  className="details-button"
  onClick={() => this.openDetailsModal(item)}
>
  View Details
</button>

            </div>
          );
        })}
      </div>
    );
  };
  

  renderCategoryDropdown = () => (
    <select
      name="category_id"
      value={this.state.category_id}
      onChange={this.handleChange}
      className="category-dropdown"
    >
      <option value="">Select Category</option>
      {this.state.categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );

  render() {

    return (
      <div id="vendor-container">
        <MainSnackbarContainer />
        <div className="main-div-displaying-detail-vendor-view-through-profile">
          <h3 id="vendor-people-fed">
            <div id="vendor-people-fed-count">
              <CountUp duration={5} delay={3} end={this.state.fedCount} />
            </div>
            Kilograms of food donated
          </h3>
          <div className="modalContainer">
            {this.state.toAddItem ? (
              <SimpleModal
                handleClose={this.handleClose}
                handleOpen={this.handleOpen}
                open={this.state.open}
                handleChange={this.handleChange}
                submitItem={this.submitItem}
                receivedOpenSnackbar={this.props.receivedOpenSnackbar}
                categories={this.state.categories} // Pass categories to SimpleModal
              />
            ) : (
              this.addItemButton()
            )}
          </div>
        </div>
        {this.state.selectedItem && (
      <div className="modal-overlay" onClick={this.closeDetailsModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>Pickup Details</h2>
          <p className="pickup-code">
            <strong>Pickup Code:</strong> {this.state.selectedItem.pickup_code || "N/A"}
          </p>
          <p className="comment">
            <strong>Comment:</strong> {this.state.selectedItem.comment || "No comments provided"}
          </p>
          <button className="close-button" onClick={this.closeDetailsModal}>
            Close
          </button>
        </div>
      </div>
    )}
        <div className="foodItemsContainer">
          <h3 className="food-items-header">Added Donations</h3>
          {this.displayFoodItems()}
        </div>
      </div>
    );
  }
}

export default DonatePage;