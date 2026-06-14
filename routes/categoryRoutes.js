const express = require("express");
const router = express.Router();
console.log("Category Routes Loaded");

const {
  getCategories,
  getListingsByCategory
} = require("../controllers/categoryController");

router.get("/", getCategories);

router.get("/:id/listings", getListingsByCategory);
console.log("Category Listing Route Registered");
module.exports = router;