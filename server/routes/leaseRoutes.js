const express = require("express");
const {
  createLease,
  getLeases,
  getLease,
  updateLease,
  deleteLease,
} = require("../controllers/leaseController");

const router = express.Router();

router.post("/", createLease);
router.get("/", getLeases);
router.get("/:id", getLease);
router.put("/:id", updateLease);
router.delete("/:id", deleteLease);

module.exports = router;
