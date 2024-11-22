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

async function createNotification(userId, message) {
  try {
    await db.none(
      "INSERT INTO notifications (user_id, message, is_read) VALUES ($1, $2, $3)",
      [userId, message, false]
    );
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

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
  const vendorId = req.params.id; // Use vendor ID instead of vendor name
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
        food_items: food_items,
        message: "received food items from vendor",
      });
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
};

const createNewFoodItem = (req, res, next) => {
  const generatePickupCode = () => {
    return Math.floor(10000 + Math.random() * 90000).toString(); // Generate a 5-digit random code
  };

  db.one(
    "INSERT INTO food_items (quantity, name, vendor_id, set_time, comment, pickup_code) VALUES (${quantity}, ${name}, ${vendor_id}, ${set_time}, ${comment}, ${pickup_code}) RETURNING *",
    {
      quantity: req.body.quantity,
      name: req.body.name,
      vendor_id: req.body.vendor_id,
      set_time: req.body.set_time,
      comment: req.body.comment,
      pickup_code: generatePickupCode(),
    }
  )
    .then((foodItem) => {
      res.status(200).json({
        status: "success",
        foodItem,
        message: "Food item created with pickup code",
      });
    })
    .catch((err) => {
      console.error("Error creating food item:", err);
      next(err);
    });
};

const foodItemClaimStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_claimed, client_id } = req.body;

    const foodItem = await db.one(
      "SELECT set_time, vendor_id, name FROM food_items WHERE id = $1",
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

    await db.none(
      "UPDATE food_items SET is_claimed = $1, client_id = $2 WHERE id = $3",
      [is_claimed, client_id, id]
    );

    await createNotification(
      foodItem.vendor_id,
      `🍗Your item ${foodItem.name} has been claimed.Check it out!`
    );

    res.status(200).json({
      status: "success",
      message: "Claim status updated and notification sent.",
    });
  } catch (err) {
    next(err);
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
    await db.none(
      "INSERT INTO notifications (user_id, message, is_read) VALUES ($1, $2, $3)",
      [
        foodItem.client_id,
        `Your item '${foodItem.name}' is ready for pickup.`,
        false,
      ]
    );

    res.status(200).json({
      status: "success",
      food_item: foodItem,
      message: "Pickup confirmed and notification sent.",
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
  getConfirmedFoodItemsByVendor 
};
