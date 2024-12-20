import React, { Component } from "react";
import "./feedCSS/Feed.css";
import axios from "axios";
import SearchBar from "./SearchBar.js";
import AllFeedItems from "./AllFeedItems.js";
import { SearchBarResults } from "./SearchBarResults.js";
import "./feedCSS/Feed.css";
import MainSnackbarContainer from "../../containers/MainSnackbarContainer.js";
import { Button } from "@material-ui/core";
import { MuiThemeProvider, createTheme } from "@material-ui/core/styles";




const theme = createTheme({
  palette: {
    primary: { 500: "#33443c" },
    secondary: {
      main: "#f3fadc",
    },
  },
  typography: {
    useNextVariants: true,
  },
});

export default class Feed extends Component {
  state = {
    allFoodItems: [],
    textInput: "",
    searchText: "",
    allVendors: [],
    fadeTrigger: [],
    filteredFoodItems: [],
    selectedCategory: null,
    allCategories: [],
    requestForm: {
      name: "",
      category: "",
      quantity: "",
      neededBy: "",
      comment: "",
    },
    showRequestForm: false,
    requestError: null,
  };

  componentDidMount() {

    document.body.id = "donations-page";

    this.getAllFoodItems();
    this.getAllVendors();
    this.getCategories();
    
    this.interval = setInterval(() => {
      this.getAllFoodItems();
    }, 60000); // Refresh every minute
  }
  
  // Clear the interval when the component unmounts
  componentWillUnmount() {

    document.body.id = "";

    clearInterval(this.interval);
  }

 getAllFoodItems = () => {
  axios
    .get("/api/foodItems")
    .then((response) => {
      const foodItems = response.data.food_items || [];
      const currentTime = new Date().toISOString();

      const validItems = foodItems.filter(
        (item) =>
          new Date(item.set_time) > new Date(currentTime) &&
          !item.is_claimed &&
          !item.is_confirmed
      );

      const groupedItems = validItems.reduce((acc, item) => {
        const vendorId = item.vendor_id;

        if (!acc[vendorId]) {
          acc[vendorId] = {
            vendorName: item.vendor_name,
            vendorAddress: item.address_field,
            vendorProfilePic: item.profile_picture, // Ensure profile_picture is included
            items: [],
          };
        }
        acc[vendorId].items.push(item);
        return acc;
      }, {});

      this.setState({
        allFoodItems: groupedItems,
        filteredFoodItems: Object.values(groupedItems).flatMap((vendor) => vendor.items),
      });
    })
    .catch((err) => {
      console.error("Error fetching food items:", err);
    });
};
  
  

  getAllVendors = () => {
    axios
      .get("/api/users/vendors/")
      .then((response) => {
        const vendors = response.data.vendors || [];
        console.log("Fetched Vendors:", vendors); // Debugging log
        const vendorProfiles = vendors.reduce((acc, vendor) => {
          acc[vendor.id] = vendor.profile_picture; 
          return acc;
        }, {});
        console.log("Processed Vendor Profiles:", vendorProfiles); // Debugging log
  
        this.setState({
          allVendors: vendorProfiles, // Map vendor_id to profile picture
        });
      })
      .catch((err) => console.error("Error fetching vendors:", err));
  };
  

  claimItem = (e, isClaimed, food_id) => {
    let targetId = food_id; 
  
    if (!!e.currentTarget.id) {
      targetId = e.currentTarget.id; // Ensure fallback to button ID if necessary
    }
  
    if (isClaimed === false) {
      const currentTime = new Date().toISOString(); // Get current time
  
      this.setState({
        fadeTrigger: [...this.state.fadeTrigger, food_id], // Fade-out animation
      });
  
      setTimeout(async () => {
        try {
          await axios.patch(`/api/fooditems/claimstatus/${targetId}`, {
            client_id: this.props.currentUser.id,
            is_claimed: true,
            current_time: currentTime,
          });
          this.getAllFoodItems(); // Refresh food items
        } catch (error) {
          if (error.response && error.response.status === 400) {
            alert(error.response.data.message); // Show error message
          } else {
            console.error("Error claiming item:", error);
          }
          this.setState({
            fadeTrigger: this.state.fadeTrigger.filter((id) => id !== food_id),
          });
        }
      }, 1100);
    } else {
      axios
        .patch(`/api/fooditems/claimstatus/${targetId}`, {
          client_id: null,
          is_claimed: false,
        })
        .then(() => {
          this.getAllFoodItems();
        });
    }
  };
  

  fireClaimingItem = targetId => {
    axios
      .patch(`/api/fooditems/claimstatus/${targetId}`, {
        client_id: this.props.currentUser.id,
        is_claimed: true
      })
      .then(() => {
        this.getAllFoodItems();
      });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { textInput } = this.state;
  
    const allItems = Object.values(this.state.allFoodItems).flatMap((vendor) =>
      vendor.items
    );
  
    const searchResults = allItems.filter((item) => {
      const matchesVendor = item.vendor_name.toLowerCase().includes(textInput);
      const matchesFood = item.name.toLowerCase().includes(textInput);
      return (
        (matchesVendor || matchesFood) &&
        !item.is_claimed &&
        !item.is_confirmed
      );
    });
  
    this.setState({
      userSearchResults: searchResults,
    });
  };


  handleSearch = (e) => {
    const searchText = e.target.value.toLowerCase();

    const allItems = Object.values(this.state.allFoodItems).flatMap(
      (vendor) => vendor.items
    );

    const filteredItems = allItems.filter((item) => {
      const matchesVendor = item.vendor_name.toLowerCase().includes(searchText);
      const matchesFood = item.name.toLowerCase().includes(searchText);
      return matchesVendor || matchesFood;
    });

    this.setState({
      textInput: searchText,
      filteredFoodItems: filteredItems,
    });
  };


  search = (allFoodItems, searchText) => {
    //if search text is blank, return empty arr for length
    if (this.state.searchText === "") return [];

    let searchResult = allFoodItems.filter(item => {
      let vendor = item.vendor_name.toLowerCase();
      let food = item.name.toLowerCase();
      let claimed = item.is_claimed;

      return (
        (vendor.includes(searchText) && claimed !== true) ||
        food.includes(searchText)
      );
    });
    return searchResult;
  };

  handleChange = (e) => {
    const searchText = e.target.value.toLowerCase();
  
    const allItems = Object.values(this.state.allFoodItems).flatMap((vendor) =>
      vendor.items
    );
  
    const searchResult = allItems.filter((item) => {
      const matchesVendor = item.vendor_name.toLowerCase().includes(searchText);
      const matchesFood = item.name.toLowerCase().includes(searchText);
      return (
        (matchesVendor || matchesFood) &&
        !item.is_claimed &&
        !item.is_confirmed
      );
    });
  
    this.setState({
      textInput: searchText,
      userSearchResults: searchResult,
    });
  };

  toggleRequestForm = () => {
    this.setState((prevState) => ({
      showRequestForm: !prevState.showRequestForm,
      requestError: null,
    }));
  };

  handleRequestChange = (e) => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      requestForm: { ...prevState.requestForm, [name]: value },
    }));
  };


  handleCategorySelect = (categoryId) => {
    this.setState((prevState) => ({
      requestForm: { ...prevState.requestForm, category: categoryId },
    }));
  };


  handleRequestSubmit = async (e) => {
    e.preventDefault();
    const { name, category, quantity, neededBy, comment } = this.state.requestForm;
  
    if (!name || !category || !quantity || !neededBy) {
      this.setState({ requestError: "All fields are required." });
      return;
    }
  
    console.log("Submitting Request Form:", this.state.requestForm); // Debugging Log
  
    try {
      const response = await axios.post("/api/fooditems/create-request", {
        name,
        category_id: category, 
        quantity,
        set_time: neededBy,
        comment,
        client_id: this.props.currentUser.id,
        type: "request",
      });
  
      if (response.status === 201) {
        this.setState({
          requestForm: { name: "", category: null, quantity: "", neededBy: "", comment: "" },
          requestError: null,
          showRequestForm: false,
        });
        this.getAllFoodItems();
      }
    } catch (error) {
      console.error("Error submitting request:", error.response || error.message);
      this.setState({ requestError: "Failed to submit request. Try again." });
    }
  };
  
getCategories = () => {
  axios
    .get("/api/categories")
    .then((response) => {
      this.setState({ allCategories: response.data.categories });
    })
    .catch((err) => console.error("Error fetching categories:", err));
};

renderRequestForm = () => {
  const { requestForm, requestError, allCategories } = this.state;

  return (
    <MuiThemeProvider theme={theme}>
      <div className="request-form-modal">
        <div className="request-form-container">
          <h3>Request a Donation</h3>
          {requestError && <p className="error">{requestError}</p>}

          <form onSubmit={this.handleRequestSubmit}>
            {/* Item Name */}
            <div className="form-group">
              <label htmlFor="name">Item Name</label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter Item Name"
                value={requestForm.name}
                onChange={this.handleRequestChange}
              />
            </div>

            {/* Categories (Horizontal Scroll or Grid) */}
            <div className="form-group">
              <label>Category</label>
              <div className="category-scroll-container">
                {allCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`category-button ${
                      requestForm.category === category.id ? "selected" : ""
                    }`}
                    onClick={() => this.handleCategorySelect(category.id)}
                  >
                    <span>{category.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity and Date-Time Picker */}
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="quantity">Quantity (Kg)</label>
                <input
                  id="quantity"
                  type="number"
                  name="quantity"
                  placeholder="Enter Quantity"
                  value={requestForm.quantity}
                  onChange={this.handleRequestChange}
                />
              </div>
              <div className="form-group half">
                <label htmlFor="neededBy">Pickup Date & Time</label>
                <input
                  id="neededBy"
                  type="datetime-local"
                  name="neededBy"
                  value={requestForm.neededBy}
                  className="custom-date-picker"
                  onChange={this.handleRequestChange}
                />
              </div>
            </div>

            {/* Comment Section */}
            <div className="form-group">
              <label htmlFor="comment">Additional Comments</label>
              <textarea
                id="comment"
                name="comment"
                placeholder="Add any comments here..."
                value={requestForm.comment}
                onChange={this.handleRequestChange}
                rows="3"
              ></textarea>
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="form-actions">
              <button type="submit" className="submit-button">
                Submit
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={this.toggleRequestForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </MuiThemeProvider>
  );
};


  render() {
 const { textInput, filteredFoodItems, allFoodItems, allVendors,showRequestForm } = this.state;
 const noDonations = Object.keys(allFoodItems).length === 0;

   
    return (
      <div className="feedWrapper">
        <MainSnackbarContainer />
        <div id="feed-header">
          <div id="feed"></div>
          <button onClick={this.toggleRequestForm} className="request-button">
            Request Donation
          </button>
        </div>
        {showRequestForm && this.renderRequestForm()}

        <SearchBar
          handleSubmit={(e) => e.preventDefault()}
          handleChange={this.handleSearch}
          textInput={textInput}
        />
        {noDonations ? (
        <div className="no-donations-container">
          <img
            src="/images/no_donations.png" 
            alt="No Donations"
            className="no-donations-image"
          />
          <h2 className="no-donations-title">No Donations Available</h2>
          <p className="no-donations-description">
            It looks like there are no donations available to claim at the moment.
          </p>
          <button className="refresh-button" onClick={this.getAllFoodItems}>
            Refresh Feed
          </button>
        </div>
      ) : textInput ? (
          <SearchBarResults
            userSearchResults={filteredFoodItems}
            claimItem={this.claimItem}
            receivedOpenSnackbar={this.props.receivedOpenSnackbar}
          />
        ) : (
          <AllFeedItems
            claimItem={this.claimItem}
            allFoodItems={this.state.allFoodItems}
            userSearchResults={this.state.userSearchResults}
            receivedOpenSnackbar={this.props.receivedOpenSnackbar}
            allVendors={this.state.allVendors} // Pass vendor profiles
            fadeTrigger={this.state.fadeTrigger}
          />
        )}
      </div>
    );
  }
}
