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

class VendorProfile extends Component {
  constructor() {
    super();
    this.state = {
      quantity: "",
      name: "",
      set_time: "",
      toAddItem: false,
      hasAdded: false,
      foodItems: [], // Unified list of items with statuses
      fedCount: 0,
      profilePic: "",
      phoneNumber: "",
      body: "",
      open: false, // for modal
    };
  }

  componentDidMount() {
    this.fetchFoodItems(); // Fetch all items
    this.getFeedingCount(); // Get feeding count

  }

  getProfileInfo = () => {
    axios.get(`/api/users/${this.props.currentUser.id}`).then((info) => {
      this.setState({
        profilePic: info.data.data[0].profile_picture,
        phoneNumber: info.data.data[0].telephone_number,
        body: info.data.data[0].body,
      });
    });
  };

  getFeedingCount = () => {
    axios.get("/api/fooditems/feedingcount").then((count) => {
      this.setState({
        fedCount: +count.data.fedCount[0].sum * 3,
      });
    });
  };

  fetchFoodItems = () => {
    axios
      .get(`/api/fooditems/vendor/${this.props.currentUser.name}`) // Fetch all food items for vendor
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
    const { quantity, name, set_time } = this.state;
    axios
      .post("/api/fooditems/", {
        quantity: quantity,
        name: name,
        set_time: set_time,
        vendor_id: this.props.currentUser.id,
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
  
      // Determine the status of the item
      if (!item.is_claimed && !item.is_confirmed) {
        status = "Claim Pending"; // Neither claimed nor confirmed
      } else if (item.is_claimed && !item.is_confirmed) {
        status = "Pickup Pending"; // Claimed but not confirmed
      } else if (!item.is_claimed && item.is_confirmed) {
        status = "Pickup Confirmed"; // Confirmed but not claimed
      }
  
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
          </div>
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

export default VendorProfile;
