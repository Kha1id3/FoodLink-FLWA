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
    };
  }

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
    const vendorName = this.props.currentUser.name;
    axios
      .get(`/api/fooditems/vendor/${vendorName}`)
      .then((res) => {
        const sortedItems = res.data.food_items.sort((a, b) => {
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
      .catch((err) => console.error("Error fetching food items:", err));
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
    this.setState({
      hasAdded: true,
    });
    const { quantity, name, set_time, comment, category_id } = this.state;
  
    axios
      .post("/api/fooditems/", {
        quantity,
        name,
        set_time,
        vendor_id: this.props.currentUser.id,
        comment,
        category_id, // Include category_id
        type: "donation", // Set type explicitly
      })
      .then(() => {
        // Refresh food items list and notifications
        this.setState({ toAddItem: false });
        this.fetchFoodItems();
  
        // Refresh notifications
        axios
          .get(`/api/notifications/${this.props.currentUser.id}`)
          .then((res) => {
            this.props.setNotifications(res.data.notifications); // Assuming `setNotifications` updates the notifications globally
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
    return this.state.foodItems.map((item) => {
      let status;

      if (!item.is_claimed && !item.is_confirmed) {
        status = "Claim Pending";
      } else if (item.is_claimed && !item.is_confirmed) {
        status = "Pickup Pending";
      } else if (!item.is_claimed && item.is_confirmed) {
        status = "Pickup Confirmed";
      }

      const isDropdownOpen = this.state.openDropdowns[item.food_id];

      return (
        <div
          key={item.food_id}
          className="vendor-profile-container-vendor-version"
        >
          <div className="claimed-vendor-items-two">
            <div className="vendor-page-item-name">
              {!item.is_claimed && !item.is_confirmed && (
                <button
                  className="delete-item-small-button"
                  id={item.food_id}
                  onClick={this.deleteItem}
                >
                  X
                </button>
              )}
              {item.name}
            </div>
            <p className="vendor-page-item-Kilograms">
              {item.quantity * 3} Kilograms
            </p>
            <p className="vendor-page-item-quantity">{item.quantity} people</p>
            <p className="vendor-page-pickup-time">
              <span className="pickup-date">{formatDate(item.set_time)}</span>
              <br />
              <span className="pickup-time">{formatTime(item.set_time)}</span>
            </p>
            <p
              className={`vendor-page-item-status ${
                status === "Claim Pending"
                  ? "status-claim-pending"
                  : status === "Pickup Pending"
                  ? "status-pickup-pending"
                  : "status-pickup-confirmed"
              }`}
            >
              {status}
            </p>
            <button
              className="details-button"
              onClick={() => this.toggleDropdown(item.food_id)}
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
    });
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
        <div className="foodItemsContainer">
          <h3 className="food-items-header">Added Donations</h3>
          {this.displayFoodItems()}
        </div>
      </div>
    );
  }
}

export default DonatePage;