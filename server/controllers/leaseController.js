const Lease = require("../models/Lease");

// CREATE
const createLease = async (req, res) => {
  try {
    const lease = await Lease.create(req.body);
    res.status(201).json(lease);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET ALL
const getLeases = async (req, res) => {
  const leases = await Lease.find().populate("tenant");
  res.json(leases);
};

// GET ONE
const getLease = async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.id).populate("tenant");
    res.json(lease);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// UPDATE
const updateLease = async (req, res) => {
  try {
    const lease = await Lease.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(lease);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE
const deleteLease = async (req, res) => {
  try {
    await Lease.findByIdAndDelete(req.params.id);
    res.json({ message: "Lease deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createLease,
  getLeases,
  getLease,
  updateLease,
  deleteLease,
};
