const mongoose = require("mongoose");

const leaseSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    rentAmount: { type: Number, required: true },
    securityDeposit: { type: Number, default: 0 },

    paymentCycle: {
      type: String,
      enum: ["Monthly", "Quarterly", "Yearly"],
      default: "Monthly",
    },

    status: {
      type: String,
      enum: ["Active", "Expired", "Terminated"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lease", leaseSchema);
