const Maintenance = require("../models/Maintenance");

// CREATE
const createMaintenance = async (req, res) => {
  try {
    const request = await Maintenance.create(req.body);
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// GET ALL
const getMaintenance = async (req, res) => {
  try {
    const requests = await Maintenance.find()
      .populate("tenant")
      .populate("propertyId");
    res.json(requests);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// GET ONE
const getMaintenanceById = async (req, res) => {
  try {
    const request = await Maintenance.findById(req.params.id)
      .populate("tenant")
      .populate("propertyId");
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// UPDATE
const updateMaintenance = async (req, res) => {
  try {
    const request = await Maintenance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE
const deleteMaintenance = async (req, res) => {
  try {
    await Maintenance.findByIdAndDelete(req.params.id);
    res.json({ message: "Maintenance deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createMaintenance,
  getMaintenance,
  getMaintenanceById,
  updateMaintenance,
  deleteMaintenance,
};
