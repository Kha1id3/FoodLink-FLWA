import React, { Component } from "react";
import axios from "axios";
import { notify } from "react-notify-toast";
import Button from "@material-ui/core/Button";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import "../vendor_claimed_profile/VendorClaimedItemsPage.css";



const theme = createMuiTheme({
  palette: {
    primary: { 500: "#5C4E4E" },
    secondary: {
      main: "#5C4E4E"
    }
  },
  typography: {
    useNextVariants: true
  }
});

class VendorClaimedItemsPage extends Component {
  constructor() {
    super();
    this.state = {
      claimedFoodItems: [], // Holds the claimed food items
    };
  }

  componentDidMount() {
    this.getClaimedFoodItemsByVendor();
  }

  getClaimedFoodItemsByVendor = () => {
    const { currentUser } = this.props;

    axios
      .get(`/api/fooditems/vendor/${currentUser.name}`) // Use vendor name
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
        notify.show("Pickup confirmed successfully!", "success", 3000); // Notify success
        this.getClaimedFoodItemsByVendor(); // Refresh list
      })
      .catch((err) => {
        notify.show("Failed to confirm pickup. Please try again.", "error", 3000); // Notify error
        console.error(err);
      });
  };

  renderClaimedItems = () => {
    const { claimedFoodItems } = this.state;

    return claimedFoodItems.map((item) => {
      const convertedTime = Number(item.set_time.slice(0, 2));
      const formattedTime =
        convertedTime === 0 || convertedTime < 13
          ? `${convertedTime}am`
          : `${convertedTime - 12}pm`;

      return (
        <div key={item.id} className="claimed-item-row">
          <div className="claimed-item-name">{item.name}</div>
          <div className="claimed-item-pounds">{item.quantity * 3} pounds</div>
          <div className="claimed-item-feeds">{item.quantity} people</div>
          <div className="claimed-item-time">{formattedTime}</div>
          <div className="claimed-item-actions">
            <MuiThemeProvider theme={theme}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => this.handleConfirmPickup(item.food_id)}
                className="confirm-pickup-button"
              >
                Confirm Pickup
              </Button>
            </MuiThemeProvider>
          </div>
        </div>
      );
    });
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
