const mongoose = require("mongoose");

const leaseSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    propertyId: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    rentAmount: { type: Number, required: true },
    securityDeposit: { type: Number },
    paymentCycle: {
      type: String,
      enum: ["Monthly", "Quarterly", "Yearly"],
      default: "Monthly",
    },
    status: {
      type: String,
      enum: ["Active", "Terminated"],
      default: "Active",
    },
    status: {
  type: String,
  enum: ["Active", "Expired", "Terminated"],
  default: "Active"
},

  },
  { timestamps: true }
);

module.exports = mongoose.model("Lease", leaseSchema);
