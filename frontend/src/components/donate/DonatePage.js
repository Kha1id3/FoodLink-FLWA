import React, { Component } from "react";
import axios from "axios";
import Button from "@material-ui/core/Button";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import CountUp from "react-countup";
import MainSnackbarContainer from "../../containers/MainSnackbarContainer.js";
import SimpleModal from "./SimpleModal.js";
import "./vendorProfilesCSS/VendorProfile.css";

const theme = createMuiTheme({
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
      foodItems: [], // Unified list of items with statuses
      fedCount: 0,
      profilePic: "",
      phoneNumber: "",
      body: "",
      open: false, // for modal
      openDropdowns: {},
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
    console.log("Current User:", this.props.currentUser); // Debug log
    if (this.props.currentUser) {
      this.fetchFoodItems(); // Fetch all items
      this.getFeedingCount(); // Get feeding count
    } else {
      console.error("Current User is not defined.");
    }
  }

  fetchFoodItems = () => {
    const vendorName = this.props.currentUser.name; // Use vendor name for the backend query
    axios
      .get(`/api/fooditems/vendor/${vendorName}`) // Fetch items for the vendor
      .then((res) => {
        const sortedItems = res.data.food_items.sort((a, b) => {
          // Sort by status: Claim Pending > Pickup Pending > Pickup Confirmed
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
    const { quantity, name, set_time, comment } = this.state; // Include comment
    axios
      .post("/api/fooditems/", {
        quantity: quantity,
        name: name,
        set_time: set_time,
        vendor_id: this.props.currentUser.id, // Include vendor ID
        comment: comment, // Send comment to the backend
      })
      .then(() => {
        this.setState({
          toAddItem: false,
        });
        this.fetchFoodItems();
      })
      .catch((err) => {
        console.log(err);
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
      const converted_time = Number(item.set_time.slice(0, 2));
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
            <p className="vendor-page-item-Kilograms">{item.quantity * 3} Kilograms</p>
            <p className="vendor-page-item-quantity">{item.quantity} people</p>
            <p className="vendor-page-pickup-time">
              {converted_time < 13 && converted_time !== 0
                ? converted_time + "am"
                : converted_time === 0
                ? 12 + "am"
                : converted_time - 12 + "pm"}
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

  render() {
    let vendorUser;
    if (this.props.currentUser.type === 2) {
      vendorUser = this.props.match.params.vendor;
    }
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
