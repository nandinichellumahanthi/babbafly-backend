const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Notification = require("../models/Notification");
const Listing = require("../models/Listing");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/reviews/:listingId — get all reviews for a listing
router.get("/:listingId", async (req, res) => {
  try {
    const reviews = await Review.find({ listingId: req.params.listingId })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    // Calculate average rating
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    const average = reviews.length ? (total / reviews.length).toFixed(1) : 0;

    res.json({ reviews, average, count: reviews.length });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// POST /api/reviews/:listingId — add a review (auth required)
router.post("/:listingId", authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Check if user already reviewed this listing
    const existing = await Review.findOne({
      listingId: req.params.listingId,
      userId: req.user.id,
    });
    if (existing) {
      return res.status(400).json({ message: "You already reviewed this listing" });
    }

    const review = await Review.create({
      listingId: req.params.listingId,
      userId: req.user.id,
      rating,
      comment,
    });

    // Notify the seller
    const listing = await Listing.findById(req.params.listingId).populate("userId", "name");
    if (listing && listing.userId && listing.userId._id.toString() !== req.user.id) {
      await Notification.create({
        userId: listing.userId._id,
        type: "review",
        title: "New Review",
        message: `Someone left a ${rating}★ review on your listing "${listing.title}"`,
        link: `/listing/${listing._id}`,
      });
    }

    // Populate and return
    const populated = await Review.findById(review._id).populate("userId", "name");
    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You already reviewed this listing" });
    }
    res.status(500).json({ message: "Failed to add review" });
  }
});

// DELETE /api/reviews/:reviewId — delete own review
router.delete("/:reviewId", authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your review" });
    }
    await review.deleteOne();
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete review" });
  }
});

module.exports = router;