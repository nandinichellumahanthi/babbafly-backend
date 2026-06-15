const Review = require("../models/Review");

// GET all reviews for a listing
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ listingId: req.params.listingId })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    // Calculate average rating
    const count = reviews.length;
    const average = count > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)
      : 0;

    res.status(200).json({
      reviews,          // ✅ array of reviews
      average,          // ✅ e.g. "4.3"
      count,            // ✅ total number of reviews
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST a new review
exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Prevent duplicate reviews from same user
    const existing = await Review.findOne({
      listingId: req.params.listingId,
      userId: req.user.id,
    });

    if (existing) {
      return res.status(400).json({ message: "You already reviewed this listing." });
    }

    const review = await Review.create({
      listingId: req.params.listingId,
      userId: req.user.id,
      rating,
      comment,
    });

    const populated = await review.populate("userId", "name");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE a review (only owner can delete)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await review.deleteOne();
    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};