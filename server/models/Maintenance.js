const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant"
    },
    issueType: {
      type: String,
      enum: ["Electrical", "Plumbing", "Cleaning", "Other"],
      required: true
    },
    description: String,

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending"
    },

    priority: {
      type: String,
      enum: ["Low", "Normal", "High"],
      default: "Normal"
    },

    reportedDate: { type: Date, default: Date.now },
    resolvedDate: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Maintenance", maintenanceSchema);
