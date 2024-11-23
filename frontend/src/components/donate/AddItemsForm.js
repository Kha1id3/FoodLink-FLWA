import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./vendorProfilesCSS/AddItemsForm.css";
import { MuiThemeProvider, createTheme } from "@material-ui/core/styles";

const theme = createTheme({
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
    const currentDate = new Date();
    const selectedDate = pickupDateTime || currentDate;

    // Only show times between 6:00 AM and 11:00 PM
    const startTime = new Date(time);
    startTime.setHours(6, 0, 0); // 6:00 AM

    const endTime = new Date(time);
    endTime.setHours(24, 0, 0); // 11:00 PM

    // Show times between startTime and endTime
    const isValidTime = time >= startTime && time <= endTime;

    // Additionally filter out passed times if it's today
    return (
      isValidTime &&
      (selectedDate.getDate() !== currentDate.getDate() ||
        time.getTime() > currentDate.getTime())
    );
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
            placeholder="How many people can this donation feed?"
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
              timeIntervals={1}
              filterTime={filterPassedTimes}
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
