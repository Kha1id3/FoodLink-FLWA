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
    primary: { 500: "#5C4E4E" },
    secondary: {
      main: "#5C4E4E",
    },
  },
  typography: {
    useNextVariants: true,
  },
})

export default class Feed extends Component {
  state = {
    allFoodItems: [],
    textInput: "",
    searchText: "",
    allVendors: [],
    fadeTrigger: [],
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
    this.getAllFoodItems();
    this.getAllVendors();
    this.getCategories();
    // Optional: Set an interval to refresh the food items periodically
    this.interval = setInterval(() => {
      this.getAllFoodItems();
    }, 60000); // Refresh every minute
  }
  
  // Clear the interval when the component unmounts
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getAllFoodItems = () => {
    axios
      .get("/api/foodItems")
      .then((foodItems) => {
        const currentTime = new Date().toISOString(); // Get the current time in ISO format
        const validItems = foodItems.data.food_items.filter((item) => {
          return new Date(item.set_time) > new Date(currentTime); // Compare pickup time with current time
        });
        this.setState({
          allFoodItems: validItems, // Set only valid (non-expired) items to state
        });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  getAllVendors = () => {
    axios.get("/api/users/vendors/").then(foodItems => {
      this.setState({
        allVendors: foodItems.data.vendors
      });
    });
  };

  claimItem = (e, isClaimed, food_id) => {
    let targetId;
    if (!!e.currentTarget.id) {
      targetId = e.currentTarget.id;
    }
    if (isClaimed === false) {
      const currentTime = new Date().toISOString(); // Get user's current time
  
      this.setState({
        fadeTrigger: [...this.state.fadeTrigger, food_id]
      });
  
      setTimeout(async () => {
        try {
          await axios.patch(`/api/fooditems/claimstatus/${targetId}`, {
            client_id: this.props.currentUser.id,
            is_claimed: true,
            current_time: currentTime // Send user's current time
          });
          this.getAllFoodItems();
        } catch (error) {
          if (error.response && error.response.status === 400) {
            alert(error.response.data.message); // Show error message
          } else {
            console.error("Error claiming item:", error);
          }
          this.setState({
            fadeTrigger: this.state.fadeTrigger.filter((id) => id !== food_id)
          });
        }
      }, 1100);
    } else {
      axios
        .patch(`/api/fooditems/claimstatus/${targetId}`, {
          client_id: null,
          is_claimed: false
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

  handleSubmit = async e => {
    e.preventDefault();
    // let searchResult = this.state.allFoodItems.filter(item => {
    //   let vendor = item.vendor_name.toLowerCase();
    //   let food = item.name.toLowerCase();
    //   let text = this.state.textInput.toLowerCase();
    //   let claimed = item.is_claimed;
    //
    //   return (vendor.includes(text) && claimed !== true) || food.includes(text);
    // });
    // const searchResults = this.search(
    //   this.state.allFoodItems,
    //   this.state.textInput.toLowerCase()
    // );
    await this.setState({
      searchText: this.state.textInput.toLowerCase(),
      textInput: ""
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

  handleChange = e => {
    let searchResult = this.state.allFoodItems.filter(item => {
      return (
        item.vendor_name.toLowerCase() === this.state.textInput.toLowerCase() ||
        item.name.toLowerCase() === this.state.textInput.toLowerCase()
      );
    });
    this.setState({
      textInput: e.target.value,
      userSearchResults: searchResult
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
        category_id: category, // Make sure this is set correctly
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
          <div className="category-buttons-container">
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
          <form onSubmit={this.handleRequestSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Item Name"
              value={requestForm.name}
              onChange={this.handleRequestChange}
            />
            <input
              type="number"
              name="quantity"
              placeholder="Quantity (Kg)"
              value={requestForm.quantity}
              onChange={this.handleRequestChange}
            />
            <input
              type="datetime-local"
              name="neededBy"
              placeholder="Pickup Time"
              value={requestForm.neededBy}
              className="custom-date-picker"
              onChange={this.handleRequestChange}
            />
            <textarea
              name="comment"
              placeholder="Additional Comments"
              value={requestForm.comment}
              onChange={this.handleRequestChange}
              rows="3"
            ></textarea>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={this.toggleRequestForm}
            >
              Cancel
            </Button>
          </form>
        </div>
      </div>
    </MuiThemeProvider>
  );
};

  render() {
    const filteredFoodItems = this.search(
      this.state.allFoodItems,
      this.state.searchText
    );

    const { showRequestForm } = this.state;
    return (
      <div className="feedWrapper">
        <MainSnackbarContainer />
        <div id="feed-header">
          <div id="feed">Donation List</div>
          <button onClick={this.toggleRequestForm} className="request-button">
            Request Donation
          </button>
        </div>
        {showRequestForm && this.renderRequestForm()}

        <SearchBar
          allFoodItems={this.state.allFoodItems}
          userSearchResults={this.state.userSearchResults}
          handleSubmit={this.handleSubmit}
          textInput={this.state.textInput}
          handleChange={this.handleChange}
          receivedOpenSnackbar={this.props.receivedOpenSnackbar}
        />
        {filteredFoodItems.length > 0 ? (
          <SearchBarResults
            claimItem={this.claimItem}
            userSearchResults={filteredFoodItems}
            currentUser={this.props.currentUser.type}
            getAllFoodItems={this.getAllFoodItems}
            foodItems={this.state.getAllFoodItems}
            receivedOpenSnackbar={this.props.receivedOpenSnackbar}
            allVendors={this.state.allVendors}
          />
        ) : (
          <AllFeedItems
            claimItem={this.claimItem}
            allFoodItems={this.state.allFoodItems}
            userSearchResults={this.state.userSearchResults}
            receivedOpenSnackbar={this.props.receivedOpenSnackbar}
            allVendors={this.state.allVendors}
            fadeTrigger={this.state.fadeTrigger}
          />
        )}
      </div>
    );
  }
}
