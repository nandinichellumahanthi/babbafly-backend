const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: String,
  iconUrl: String,
});

module.exports = mongoose.model("Category", categorySchema);