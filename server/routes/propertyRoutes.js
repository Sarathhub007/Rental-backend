// Rental-backend/server/routes/propertyRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { createProperty, getAllProperties, getPropertyById, deleteProperty, updateProperty } = require("../controllers/propertyController");

// ensure uploads folder exists
const uploadDir = path.join(__dirname, "../../uploads");
const fs = require("fs");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// multer disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  },
});
const upload = multer({ storage });

router.post("/add", upload.array("images", 6), createProperty);
router.get("/all", getAllProperties);
router.get("/:id", getPropertyById);
router.put("/:id", updateProperty);
router.delete("/:id", deleteProperty);

module.exports = router;
