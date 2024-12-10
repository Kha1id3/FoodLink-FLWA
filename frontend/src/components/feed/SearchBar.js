import React, { useState } from "react";
import "./feedCSS/SearchBar.css";
import SearchIcon from "@material-ui/icons/Search";
import CloseIcon from "@material-ui/icons/Close";

const SearchBar = ({ handleSubmit, handleChange, textInput }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev); // Toggle search bar visibility
  };

  return (
    <div id="search-bar-wrapper">
      {isSearchOpen ? (
        <div id="search-container" className="open">
          <form onSubmit={handleSubmit} className="search-form">
            <input
              id="search-input"
              type="text"
              placeholder="Search..."
              value={textInput}
              onChange={handleChange}
            />
            <button id="search-submit" type="submit" className="search-button">
              <SearchIcon />
            </button>
            <button
              id="close-search"
              type="button"
              onClick={toggleSearch}
              className="search-button"
            >
              <CloseIcon />
            </button>
          </form>
        </div>
      ) : (
        <button id="search-toggle-button" onClick={toggleSearch}>
          <SearchIcon style={{ marginRight: "5px" }} />
          Search
        </button>
      )}
    </div>
  );
};

export default SearchBar;
