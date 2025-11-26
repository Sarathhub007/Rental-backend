const Tenant = require("../models/Tenant.js");

// CREATE
const createTenant = async (req, res) => {
  try {
    const tenant = await Tenant.create(req.body);
    res.status(201).json(tenant);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// READ all
const getTenants = async (req, res) => {
  const tenants = await Tenant.find();
  res.json(tenants);
};

// READ one
const getTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });
    res.json(tenant);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// UPDATE
const updateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(tenant);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE
const deleteTenant = async (req, res) => {
  try {
    await Tenant.findByIdAndDelete(req.params.id);
    res.json({ message: "Tenant removed" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createTenant,
  getTenants,
  getTenant,
  updateTenant,
  deleteTenant,
};
