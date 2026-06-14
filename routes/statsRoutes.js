const express = require("express");
const router = express.Router();

const Listing = require("../models/Listing");
const Category = require("../models/Category");

router.get("/", async (req, res) => {
  try {
    const listings = await Listing.countDocuments();
    const categories = await Category.countDocuments();

    res.json({
      listings,
      categories,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;