import React, { useState } from "react";
import "./donateCSS/AddItemsForm.css";

const AddItemForm = (props) => {
  const [pickupDateTime, setPickupDateTime] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleDateChange = (e) => {
    const selectedDateTime = e.target.value;
    setPickupDateTime(selectedDateTime);

    props.handleChange({
      target: {
        name: "set_time",
        value: selectedDateTime,
      },
    });
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
<div className="add-item-form-container">
  <div className="form-header">
    <h2>Add a Donation</h2>
  </div>
  <form
    onSubmit={(e) => {
      props.submitItem(e);
      props.receivedOpenSnackbar();
    }}
    className="add-item-form"
  >

    <h4>Item Name</h4>
    {/* Item Name */}
    <input
      type="text"
      onChange={props.handleChange}
      name="name"
      placeholder="Enter Item Name"
      className="form-input"
    />

    {/* Category Selection */}
    <div className="category-section">
      <h4>Select a Category</h4>
      <div className="category-buttons">
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

    {/* Quantity and Pickup Date */}
    <div className="form-row">
      <div className="form-group">
        <label htmlFor="quantity">Enter Quantity (Kg)</label>
        <input
          id="quantity"
          type="number"
          onChange={props.handleChange}
          name="quantity"
          placeholder="Enter Quantity"
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label htmlFor="pickupDateTime">Pickup Date & Time</label>
        <input
          id="pickupDateTime"
          type="datetime-local"
          value={pickupDateTime || ""}
          onChange={handleDateChange}
          min={new Date().toISOString().slice(0, 16)}
          required
          className="form-input"
        />
      </div>
    </div>

    {/* Additional Comments */}
    <textarea
      onChange={props.handleChange}
      name="comment"
      placeholder="Add any comments here..."
      className="form-textarea"
    ></textarea>


        {/* Buttons */}
        <div className="form-buttons">
          <button type="submit" className="form-submit-btn">
            Submit
          </button>
          <button
            type="button"
            className="form-cancel-btn"
            onClick={props.cancelAction}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddItemForm;
