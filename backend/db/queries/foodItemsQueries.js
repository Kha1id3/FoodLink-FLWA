const { db } = require("../index.js");

getFedCount = (req, res, next) => {
  db.any(
    "SELECT SUM(quantity) FROM food_items WHERE vendor_id=$1 AND is_claimed = TRUE",
    [+req.session.currentUser.id]
  )
    .then(fedCount => {
      res.status(200).json({
        status: "success",
        fedCount: fedCount,
        message: "received total fed count for current vendor"
      });
    })
    .catch(err => {
      return next(err);
    });
};


const createNotification = async ({ vendor_id, client_id, message }) => {
  if (!vendor_id && !client_id) {
    console.error("Error creating notification: Both vendor_id and client_id are missing.");
    throw new Error("Either vendor_id or client_id is required to create a notification.");
  }

  try {
    await db.none(
      `INSERT INTO notifications (vendor_id, client_id, message, is_read, created_at) 
       VALUES ($1, $2, $3, FALSE, NOW())`,
      [vendor_id || null, client_id || null, message]
    );
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

getAllFoodItems = (req, res, next) => {
  db.any(
    "SELECT food_items.*, users.name AS vendor_name, users.address_field, users.telephone_number FROM food_items JOIN users ON food_items.vendor_id = users.id ORDER BY food_items.set_time ASC"
  )
    .then(food_items => {
      res.status(200).json({
        status: "success",
        food_items: food_items,
        message: "received all food items"
      });
    })
    .catch(err => {
      return next(err);
    });
};

getAllClaimedFoodItems = (req, res, next) => {
  db.any(
    `SELECT food_clients.*, users.name AS vendor_name 
     FROM (SELECT food_items.*, users.name AS client_name, users.address_field, users.telephone_number 
           FROM food_items 
           JOIN users ON food_items.client_id = users.id 
           WHERE is_claimed = TRUE AND is_confirmed = FALSE) AS food_clients 
     JOIN users ON food_clients.vendor_id = users.id 
     WHERE client_id = $1`,
    [+req.session.currentUser.id]
  )
    .then(food_items => {
      res.status(200).json({
        status: "success",
        food_items: food_items,
        message: "received all food items"
      });
    })
    .catch(err => {
      return next(err);
    });
};

//after claiming it

getFoodItemsByClient = (req, res, next) => {
  const clientName = req.params.name;
  db.any(
    "SELECT * FROM food_items JOIN users ON food_items.client_id=users.id WHERE users.name=$1",
    [clientName]
  )
    .then(food_items => {
      res.status(200).json({
        status: "sucess",
        food_items: food_items,
        message: "received food items from client"
      });
    })
    .catch(err => {
      return next(err);
    });
};

getFoodItemsByVendorName = (req, res, next) => {
  let vendorName = req.params.name;
  db.any(
    `SELECT 
      food_items.id AS food_id, 
      food_items.quantity, 
      food_items.name, 
      food_items.client_id, 
      food_items.vendor_id, 
      food_items.is_claimed, 
      food_items.is_confirmed, 
      food_items.set_time, 
      food_items.comment,
      food_items.pickup_code,
      users.id AS user_id, 
      users.name AS vendor_name, 
      users.email AS vendor_email, 
      users.type, 
      users.address_field AS vendor_address, 
      users.body, 
      users.telephone_number, 
      users.ein 
    FROM food_items 
    JOIN users ON food_items.vendor_id = users.id 
    WHERE users.name =$1`,
    [vendorName]
  )
    .then(food_items => {
      res.status(200).json({
        status: "success",
        food_items: food_items,
        message: "received food items from vendor"
      });
    })
    .catch(err => {
      console.error(err);
      next(err);
    });
};

getFoodItemsByVendorId = (req, res, next) => {
  const vendorId = parseInt(req.params.id, 10);
  if (isNaN(vendorId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid vendor ID",
      food_items: [],
    });
  }

  db.any(
    `SELECT 
      food_items.id AS food_id, 
      food_items.quantity, 
      food_items.name, 
      food_items.client_id, 
      food_items.vendor_id, 
      food_items.is_claimed, 
      food_items.is_confirmed, 
      food_items.set_time, 
      food_items.comment, 
      food_items.pickup_code,
      users.name AS vendor_name 
    FROM food_items 
    JOIN users ON food_items.vendor_id = users.id 
    WHERE food_items.vendor_id = $1`,
    [vendorId]
  )
    .then((food_items) => {
      res.status(200).json({
        status: "success",
        food_items: food_items || [], // Always return an array
        message: "Received food items for vendor ID",
      });
    })
    .catch((err) => {
      console.error("Error fetching food items by vendor ID:", err);
      next(err);
    });
};



const createNewFoodItem = async (req, res, next) => {
  const generatePickupCode = () => Math.floor(10000 + Math.random() * 90000).toString();

  try {
    const { quantity, name, vendor_id, set_time, comment, category_id } = req.body;

    if (!quantity || !name || !vendor_id || !set_time || !category_id) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: quantity, name, vendor_id, set_time, or category_id.",
      });
    }

    const foodItem = await db.one(
      `INSERT INTO food_items (quantity, name, vendor_id, set_time, comment, pickup_code, category_id, type) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [quantity, name, vendor_id, set_time, comment, generatePickupCode(), category_id, "donation"]
    );

    await createNotification({
      vendor_id,
      message: `🍏 Your item "${foodItem.name}" has been added successfully.`,
    });

    await matchDonationsAndRequests(foodItem);

    res.status(201).json({
      status: "success",
      foodItem,
      message: "Food item created successfully with a pickup code.",
    });
  } catch (err) {
    console.error("Error creating food item:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to create food item.",
      error: err.message,
    });
  }
};

const foodItemClaimStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_claimed, client_id } = req.body;

    // Validate input
    if (!id || typeof is_claimed !== "boolean" || !client_id) {
      return res.status(400).json({
        status: "error",
        message: "Missing or invalid fields: id, is_claimed, or client_id.",
      });
    }

    // Fetch food item details
    const foodItem = await db.one(
      `SELECT id, set_time, vendor_id, name 
       FROM food_items 
       WHERE id = $1`,
      [id]
    );

    const currentTime = new Date();
    const pickupTime = new Date(foodItem.set_time);

    if (currentTime >= pickupTime) {
      return res.status(400).json({
        status: "error",
        message: "Item cannot be claimed after the pickup time.",
      });
    }

    // Update claim status
    await db.none(
      `UPDATE food_items 
       SET is_claimed = $1, client_id = $2 
       WHERE id = $3`,
      [is_claimed, client_id, id]
    );

    // Notifications
    if (is_claimed) {
      // Notify client
      await db.none(
        `INSERT INTO notifications (client_id, message, is_read, created_at) 
         VALUES ($1, $2, FALSE, NOW())`,
        [client_id, `☑️ You have successfully claimed the item '${foodItem.name}'.`]
      );

      // Notify vendor
      await db.none(
        `INSERT INTO notifications (vendor_id, message, is_read, created_at) 
         VALUES ($1, $2, FALSE, NOW())`,
        [foodItem.vendor_id, `🍏 Your item '${foodItem.name}' has been claimed.`]
      );
    }

    res.status(200).json({
      status: "success",
      message: "Claim status updated successfully.",
    });
  } catch (err) {
    console.error("Error in foodItemClaimStatus:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to update claim status.",
      error: err.message,
    });
  }
};

updateFoodItem = (req, res, next) => {
  let queryStringArray = [];
  let bodyKeys = Object.keys(req.body);
  bodyKeys.forEach(key => {
    queryStringArray.push(key + "=${" + key + "}");
  });
  let queryString = queryStringArray.join(",");
  if (req.body.quantity === "null") {
    req.body.quantity = null;
  }
  if (req.body.name && req.body.name.toLowerCase() === "null") {
    req.body.name = null;
  }
  if (req.body.set_time && req.body.set_time.toLowerCase() === "null") {
    req.body.set_time = null;
  }
  if (req.body.comment && req.body.comment.toLowerCase() === "null") {
    req.body.comment = null;
  }

  db.none(
    "UPDATE food_items SET " +
      queryString +
      " WHERE id=" +
      Number(req.params.id),
    req.body
  )
    .then(() => {
      res.status(200).json({
        status: "success",
        message: "updated food item"
      });
    })
    .catch(err => {
      return next(err);
    });
};

deleteFoodItem = (req, res, next) => {
  const foodItemID = Number(req.params.id);
  db.result("DELETE FROM food_items WHERE id=$1", foodItemID)
    .then(result => {
      res.status(200).json({
        status: "success",
        message: "removed a food item",
        result: result
      });
    })
    .catch(err => next(err));
};

const confirmPickup = async (req, res, next) => {
  const { id } = req.params;

  try {
    const foodItem = await db.one(
      `UPDATE food_items 
       SET is_confirmed = TRUE, is_claimed = FALSE 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    if (!foodItem) {
      throw new Error("Food item not found or update failed");
    }

    // Create a notification for the client
    if (foodItem.client_id) {
      await db.none(
        `INSERT INTO notifications (client_id, message, is_read, created_at) 
         VALUES ($1, $2, FALSE, NOW())`,
        [
          foodItem.client_id,
          `☑️ Your item '${foodItem.name}' has been confirmed as picked up.`,
        ]
      );
    }

    // Create a notification for the vendor
    if (foodItem.vendor_id) {
      await db.none(
        `INSERT INTO notifications (vendor_id, message, is_read, created_at) 
         VALUES ($1, $2, FALSE, NOW())`,
        [
          foodItem.vendor_id,
          `🍏 The item '${foodItem.name}' you donated has been confirmed as picked up.`,
        ]
      );
    }

    res.status(200).json({
      status: "success",
      food_item: foodItem,
      message: "Pickup confirmed and notifications sent.",
    });
  } catch (err) {
    console.error("Error in confirmPickup function:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to confirm pickup",
      error: err.message,
    });
  }
};

// Function to get confirmed items for a specific vendor
const getConfirmedFoodItemsByVendor = (req, res, next) => {
  const { vendorId } = req.params;

  db.any(
    `SELECT * FROM food_items 
     WHERE vendor_id = $1 AND is_confirmed = TRUE`,
    [vendorId]
  )
    .then((confirmedFoodItems) => {
      res.status(200).json({ confirmed_food_items: confirmedFoodItems });
    })
    .catch((err) => {
      console.error("Error fetching confirmed food items:", err);
      next(err);
    });
};


const findMatchingDonations = async (category_id, quantity) => {
  return db.any(
    `SELECT * FROM food_items 
     WHERE category_id = $1 AND quantity >= $2 AND type = 'donation' AND is_matched = FALSE`,
    [category_id, quantity]
  );
};





const createRequestedItem = async (req, res, next) => {
  try {
    const { name, category_id, quantity, comment, set_time, client_id } = req.body;

    if (!name || !category_id || !quantity || !client_id || !set_time) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: name, category_id, quantity, set_time, or client_id.",
      });
    }

    const requestedItem = await db.one(
      `INSERT INTO food_items (name, category_id, quantity, client_id, comment, type, set_time, expires_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        name,
        category_id,
        quantity,
        client_id,
        comment,
        "request",
        set_time,
        set_time,
      ]
    );

    await createNotification({
      client_id,
      message: `🔔 Your request for '${requestedItem.quantity}' items has been successfully created and will expire at ${set_time}.`,
    });

    await matchDonationsAndRequests(requestedItem);

    res.status(201).json({
      status: "success",
      requestedItem,
      message: "Requested item created successfully with a pickup time.",
    });
  } catch (err) {
    console.error("Error creating requested item:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to create requested item.",
      error: err.message,
    });
  }
};


const matchDonationsAndRequests = async (newItem) => {
  const { id, category_id, quantity, type, set_time, name, client_id, vendor_id } = newItem;

  try {
    // Determine the opposite type for matching (request matches donation, and vice versa)
    const oppositeType = type === "request" ? "donation" : "request";

    // Find matches with the same category, quantity, and date
    const matches = await db.any(
      `SELECT * 
       FROM food_items 
       WHERE category_id = $1 
       AND quantity = $2 
       AND type = $3 
       AND is_matched = FALSE 
       AND DATE(set_time) = DATE($4)`, // Match on the same date
      [category_id, quantity, oppositeType, set_time]
    );

    for (const match of matches) {
      // Create a match record in the matched_items table
      await db.none(
        `INSERT INTO matched_items (request_id, donation_id) 
         VALUES ($1, $2)`,
        [type === "request" ? id : match.id, type === "request" ? match.id : id]
      );

      // Update `is_matched` for both items
      await db.none(
        `UPDATE food_items 
         SET is_matched = TRUE 
         WHERE id IN ($1, $2)`,
        [id, match.id]
      );

      // Send notifications with the food item name instead of the quantity
      if (type === "request") {
        // Notify the client
        if (client_id) {
          await createNotification({
            client_id: client_id,
            message: `🔔 Your request for '${name}' has been matched with a donation!`,
          });
        }

        // Notify the vendor
        if (match.vendor_id) {
          await createNotification({
            vendor_id: match.vendor_id,
            message: `🔔 Your donation '${match.name}' has been matched with a client request!`,
          });
        }
      } else {
        // Notify the client
        if (match.client_id) {
          await createNotification({
            client_id: match.client_id,
            message: `🔔 Your request for '${match.name}' has been matched with a donation!`,
          });
        }

        // Notify the vendor
        if (vendor_id) {
          await createNotification({
            vendor_id: vendor_id,
            message: `🔔 Your donation '${name}' has been matched with a client request!`,
          });
        }
      }
    }
  } catch (err) {
    console.error("Error in matchDonationsAndRequests:", err);
    throw err;
  }
};


const getAllRequestedItems = async (req, res, next) => {
  try {
    const requestedItems = await db.any(
      `SELECT food_items.*, food_categories.name AS category_name, users.name AS client_name 
       FROM food_items 
       JOIN food_categories ON food_items.category_id = food_categories.id 
       JOIN users ON food_items.client_id = users.id 
       WHERE type = 'request' 
       ORDER BY created_at DESC`
    );

    res.status(200).json({
      status: "success",
      requestedItems,
      message: "Fetched all requested items.",
    });
  } catch (err) {
    console.error("Error fetching requested items:", err);
    next(err);
  }
};





module.exports = {
  getFedCount,
  getAllFoodItems,
  getAllClaimedFoodItems,
  getFoodItemsByClient,
  getFoodItemsByVendorName,
  createNewFoodItem,
  foodItemClaimStatus,
  updateFoodItem,
  deleteFoodItem,
  confirmPickup,                
  getConfirmedFoodItemsByVendor,
  getAllRequestedItems,
  createRequestedItem,
  findMatchingDonations,
  matchDonationsAndRequests
};
