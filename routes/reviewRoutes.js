const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getReviews, createReview, deleteReview } = require("../controllers/reviewController");

router.get("/:listingId", getReviews);                        // GET all reviews
router.post("/:listingId", authMiddleware, createReview);     // POST new review
router.delete("/:id", authMiddleware, deleteReview);          // DELETE a review

module.exports = router;