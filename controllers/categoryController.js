const Category = require("../models/Category");
const Listing = require("../models/Listing");

// GET ALL CATEGORIES
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// GET LISTINGS BY CATEGORY
exports.getListingsByCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    const listings = await Listing.find({
      category: category.name
    });

    res.status(200).json(listings);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};