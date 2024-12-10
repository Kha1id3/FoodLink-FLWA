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
  getConfirmedFoodItemsByVendor,
  createRequestedItem // New function in queries
} = require("../db/queries/foodItemsQueries.js");

// Existing Routes
router.get("/", getAllFoodItems);
router.get("/client", getAllClaimedFoodItems);
router.get("/clientpage/:name", getFoodItemsByClient);
router.get("/vendor/name/:name", getFoodItemsByVendorName);
router.get("/feedingcount", getFedCount);
router.patch("/claimstatus/:id", foodItemClaimStatus);
router.post("/", createNewFoodItem);
router.patch("/:id", updateFoodItem);
router.delete("/:id", deleteFoodItem);
router.get("/vendor/id/:id", getFoodItemsByVendorId);
router.patch("/claimstatus/:id", foodItemClaimStatus);

// New Routes for Confirm Pickup Feature
router.patch("/confirmpickup/:id", confirmPickup);
router.get("/vendor/confirmed/:vendorId", getConfirmedFoodItemsByVendor);
router.post("/create-request", async (req, res, next) => {
  console.log("Current user (from session):", req.session?.currentUser);
  await createRequestedItem(req, res, next); // Use the correct function name
});




module.exports = router;
