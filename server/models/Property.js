// Rental-backend/server/models/Property.js
const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  url: { type: String },
  filename: { type: String },
  version: { type: Number, default: 1 },
});

const PropertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  location: { type: String, index: true },
  size: String, // e.g. "1200 sqft"
  bhk: Number,
  type: String, // "villa", "apartment", etc.
  price: Number, // owner provided price (optional)
  aiPrice: Number, // predicted price from AI
  images: [ImageSchema],
  status: { type: String, enum: ["active","vacant","under_maintenance"], default: "active" },
  ownerId: { type: String }, // optional Clerk user id
}, { timestamps: true });

PropertySchema.index({ title: "text", description: "text", location: "text" });

module.exports = mongoose.model("Property", PropertySchema);
