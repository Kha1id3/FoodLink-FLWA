var express = require("express");
var router = express.Router();
const {
  getFedCount,
  getAllFoodItems,
  getAllClaimedFoodItems,
  getFoodItemsByClient,
  getFoodItemsByVendorName,
  foodItemClaimStatus,
  createNewFoodItem,
  updateFoodItem,
  deleteFoodItem,
  confirmPickup,                // New function in queries
  getConfirmedFoodItemsByVendor // New function in queries
} = require("../db/queries/foodItemsQueries.js");

// Existing Routes
router.get("/", getAllFoodItems);
router.get("/client", getAllClaimedFoodItems);
router.get("/clientpage/:name", getFoodItemsByClient);
router.get("/vendor/:name", getFoodItemsByVendorName);
router.get("/feedingcount", getFedCount);
router.patch("/claimstatus/:id", foodItemClaimStatus);
router.post("/", createNewFoodItem);
router.patch("/:id", updateFoodItem);
router.delete("/:id", deleteFoodItem);

// New Routes for Confirm Pickup Feature
router.patch("/confirmpickup/:id", confirmPickup);
router.get("/vendor/confirmed/:vendorId", getConfirmedFoodItemsByVendor);

module.exports = router;
