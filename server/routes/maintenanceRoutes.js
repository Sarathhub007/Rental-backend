const express = require("express");
const {
  createMaintenance,
  getMaintenance,
  getMaintenanceById,
  updateMaintenance,
  deleteMaintenance,
} = require("../controllers/maintenanceController");

const router = express.Router();

router.post("/add", createMaintenance);
router.get("/", getMaintenance);
router.get("/:id", getMaintenanceById);
router.put("/:id", updateMaintenance);
router.delete("/:id", deleteMaintenance);

module.exports = router;
