import React, { Component } from "react";
import axios from "axios";
import "./MatchedItemsPage.css";

class MatchedItemsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      matchedItems: [],
      loading: true,
      error: "",
      fadeTrigger: [], // For animation triggers
    };
  }

  componentDidMount() {
    this.fetchMatchedItems();
  }

  // Fetch matched items from the server
  fetchMatchedItems = async () => {
    const { currentUser } = this.props; // Access currentUser prop
    if (!currentUser || !currentUser.id) {
      console.error("No valid user data provided");
      this.setState({ error: "User data is missing" });
      return;
    }

    try {
      const response = await axios.get(`/api/matched-items/${currentUser.id}`);
      console.log("Fetched Matched Items:", response.data.matchedItems);
      this.setState({ matchedItems: response.data.matchedItems, loading: false });
    } catch (error) {
      console.error("Error fetching matched items:", error);
      this.setState({ error: "Failed to fetch matched items", loading: false });
    }
  };

  // Claim a matched item
  claimItem = async (matchedId) => {
    const { currentUser } = this.props;
    if (!currentUser || !currentUser.id) return;

    this.setState((prevState) => ({
      fadeTrigger: [...prevState.fadeTrigger, matchedId],
    }));

    try {
      await axios.patch(`/api/fooditems/claimstatus/${matchedId}`, {
        client_id: currentUser.id,
        is_claimed: true,
      });
      this.setState((prevState) => ({
        matchedItems: prevState.matchedItems.filter(
          (item) => item.matched_id !== matchedId
        ),
      }));
    } catch (error) {
      console.error("Error claiming item:", error);
      this.setState((prevState) => ({
        fadeTrigger: prevState.fadeTrigger.filter((id) => id !== matchedId),
      }));
    }
  };

  render() {
    const { matchedItems, loading, error, fadeTrigger } = this.state;

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
      <div className="matched-items-page">
        <h1>Matched Items</h1>
        {matchedItems.length === 0 ? (
          <p>No matched items available.</p>
        ) : (
          <ul>
            {matchedItems.map((item) => (
              <li
                key={item.matched_id}
                className={`matched-item ${
                  fadeTrigger.includes(item.matched_id) ? "fade-out" : ""
                }`}
              >
                <p>
                  <strong>Request:</strong> {item.request_name} (
                  {item.request_quantity} units)
                </p>
                <p>
                  <strong>Donation:</strong> {item.donation_name} (
                  {item.donation_quantity} units)
                </p>
                <p>
                  <strong>Category:</strong> {item.category_name}
                </p>
                <button
                  onClick={() => this.claimItem(item.matched_id)}
                  className="claim-button"
                >
                  Claim Item
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
}

export default MatchedItemsPage;
