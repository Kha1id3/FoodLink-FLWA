import React, { useEffect, useState } from "react";
import axios from "axios";


const MatchedItemsPage = ({ currentUser }) => {
  const [matchedItems, setMatchedItems] = useState([]);

  useEffect(() => {
    const fetchMatchedItems = async () => {
      try {
        const response = await axios.get(`/api/matched-items/${currentUser.id}`);
        setMatchedItems(response.data.matchedItems || []);
      } catch (error) {
        console.error("Error fetching matched items:", error);
      }
    };
    fetchMatchedItems();
  }, [currentUser.id]);

  return (
    <div className="matched-items-container">
      <h1>Matched Items</h1>
      {matchedItems.length > 0 ? (
        <ul>
          {matchedItems.map((item) => (
            <li key={item.id}>
              <strong>Request:</strong> {item.request_name} ({item.request_quantity} units)
              <br />
              <strong>Donation:</strong> {item.donation_name} ({item.donation_quantity} units)
              <br />
              <strong>Category:</strong> {item.category_name}
            </li>
          ))}
        </ul>
      ) : (
        <p>No matched items found.</p>
      )}
    </div>
  );
};

export default MatchedItemsPage;
