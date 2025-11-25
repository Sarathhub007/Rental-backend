// Rental-backend/server/controllers/propertyController.js
const Property = require("../models/Property");
const fs = require("fs");
const path = require("path");

// reuse groqAI from your top-level index — we'll require it via relative path later
const { groqAI } = require("../../utils/aiHelper"); // we'll create this helper

exports.createProperty = async (req, res) => {
  try {
    const { title, description, location, size, bhk, type, price, ownerId } = req.body;

    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((f) => {
        images.push({ url: `/uploads/${f.filename}`, filename: f.filename });
      });
    }

    // Create property first (aiPrice null for now)
    const property = await Property.create({
      title,
      description,
      location,
      size,
      bhk: bhk ? Number(bhk) : undefined,
      type,
      price: price ? Number(price) : undefined,
      images,
      ownerId,
    });

    // Build features for AI price prediction and call groqAI helper
    // try {
    //   const prompt = `
    //     Predict a reasonable monthly rent (INR) for a property with:
    //     Location: ${location}
    //     Area: ${size || "unknown"}
    //     BHK: ${bhk || "unknown"}
    //     Type: ${type || "unknown"}
    //   Return only a number.`;
    //   const aiResp = await groqAI(prompt);
    //   const matched = aiResp && aiResp.match && aiResp.match(/[\d,\.]+/);
    //   const priceNumber = matched ? Number(matched[0].replace(/,/g, "")) : null;

    //   if (priceNumber) {
    //     property.aiPrice = priceNumber;
    //     await property.save();
    //   }
    // } catch (aiErr) {
    //   console.warn("AI price prediction failed:", aiErr.message || aiErr);
    // }

    res.status(201).json(property);
  } catch (err) {
    console.error("createProperty error:", err);
    res.status(500).json({ error: "Failed to create property" });
  }
};

exports.getAllProperties = async (req, res) => {
  try {
    const q = req.query.q || "";
    const filter = q ? { $text: { $search: q } } : {};
    const properties = await Property.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    res.json(properties);
    // console.log(properties)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id).lean();
    if (!prop) return res.status(404).json({ error: "Not found" });
    res.json(prop);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch property" });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const prop = await Property.findByIdAndDelete(req.params.id);
    if (!prop) return res.status(404).json({ error: "Not found" });

    // remove image files (optional)
    if (prop.images && prop.images.length) {
      prop.images.forEach((img) => {
        const p = path.join(__dirname, "../../uploads", img.filename);
        fs.unlink(p, (e) => {});
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete" });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const update = req.body;
    if (update.bhk) update.bhk = Number(update.bhk);
    const prop = await Property.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(prop);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update property" });
  }
};
