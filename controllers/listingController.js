const Listing = require("../models/Listing");

// GET ALL LISTINGS + FILTERING + SORTING
exports.getAllListings = async (req, res) => {
  try {
    let query = {};

    // Filter by location
    if (req.query.location) {
      query.location = req.query.location;
    }

    // Filter by price range
    if (req.query.price) {
      const [min, max] = req.query.price.split("-");

      query.price = {
        $gte: Number(min),
        $lte: Number(max),
      };
    }

    let listingsQuery = Listing.find(query);

    // Sorting
    if (req.query.sort === "price_low") {
      listingsQuery = listingsQuery.sort({ price: 1 });
    }

    if (req.query.sort === "price_high") {
      listingsQuery = listingsQuery.sort({ price: -1 });
    }

    if (req.query.sort === "latest") {
      listingsQuery = listingsQuery.sort({ createdAt: -1 });
    }

    if (req.query.sort === "popular") {
      listingsQuery = listingsQuery.sort({ rating: -1 });
    }

    const listings = await listingsQuery;

    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET SINGLE LISTING
exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    res.status(200).json(listing);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// CREATE LISTING
exports.createListing = async (req, res) => {
  try {
    const listing = await Listing.create(req.body);

    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE LISTING
exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    res.status(200).json(listing);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE LISTING
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    res.status(200).json({
      message: "Listing deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};