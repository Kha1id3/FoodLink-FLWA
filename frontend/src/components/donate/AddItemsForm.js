import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./vendorProfilesCSS/AddItemsForm.css";
import { MuiThemeProvider, createTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  palette: {
    primary: { 500: "#D35348" },
    secondary: {
      main: "#D35348",
    },
  },
  typography: {
    useNextVariants: true,
  },
});

const AddItemForm = (props) => {
  const [pickupDateTime, setPickupDateTime] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleDateChange = (date) => {
    if (date instanceof Date && !isNaN(date)) {
      setPickupDateTime(date);
      props.handleChange({
        target: {
          name: "set_time",
          value: date.toISOString(),
        },
      });
    }
  };

  const filterPassedTimes = (time) => {
    const selectedDate = pickupDateTime || new Date();
    const selectedHour = time.getHours();

    // Allow only times between 6:00 AM and 11:00 PM
    return selectedHour >= 6 && selectedHour <= 23;
  };

  const handleCategorySelection = (categoryId) => {
    setSelectedCategory(categoryId);
    props.handleChange({
      target: {
        name: "category_id",
        value: categoryId,
      },
    });
  };


  return (
    <div className="donationFormWrapper">
      <h1 id="donation-form-header">Donation Form</h1>
      <div className="donationFormContainer">
        <form
          onSubmit={(e) => {
            props.submitItem(e);
            props.receivedOpenSnackbar();
          }}
          id="add-items-form"
        >
          {/* Category Selection */}
          <div className="category-selection-container">
            <h4>Select a Category</h4>
            <div className="category-grid">
              {props.categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`category-button ${
                    selectedCategory === category.id ? "selected" : ""
                  }`}
                  onClick={() => handleCategorySelection(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          <br />
          {/* Input Fields */}
          <input
            type="text"
            onChange={props.handleChange}
            name="name"
            placeholder="What dish are you donating?"
            id="input-name"
          />
          <br />
          <input
            type="text"
            onChange={props.handleChange}
            name="quantity"
            placeholder="Quantity (kg)"
            id="input-quantity"
          />
          <br />
          <textarea
            onChange={props.handleChange}
            name="comment"
            placeholder="Enter pickup instructions or additional comments"
            id="input-comment"
            rows="4"
          ></textarea>
          <br />
          <div className="datePickerContainer">
            <DatePicker
              selected={pickupDateTime}
              onChange={handleDateChange}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              timeIntervals={30}
              placeholderText="Select pickup date and time"
              className="custom-date-picker"
              minDate={new Date()}
            />
          </div>
          <MuiThemeProvider theme={theme}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              id="add-food-item-button"
            >
              <div id="add-item">Submit</div>
            </Button>
          </MuiThemeProvider>
        </form>
      </div>
    </div>
  );
};

export default AddItemForm;