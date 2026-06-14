const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    category: String,
    price: Number,
    location: String,
    images: [String],

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
sold: { type: Boolean, default: false },

    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Listing", listingSchema);