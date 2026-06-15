const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    category: String,
    price: Number,
    location: String,
    images: [String],

    userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",   // 👈 must say "User" exactly
  required: true,
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