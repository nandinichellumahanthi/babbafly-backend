const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing
} = require("../controllers/listingController");

router.get("/", getAllListings);
router.get("/:id", getListingById);

router.post("/", authMiddleware, createListing);
router.put("/:id", authMiddleware, updateListing);
router.delete("/:id", authMiddleware, deleteListing);

module.exports = router;