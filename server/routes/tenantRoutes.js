const express=require("express")
const {
  createTenant,
  getTenants,
  getTenant,
  updateTenant,
  deleteTenant,
} =require( "../controllers/tenantController.js")

const router = express.Router();

router.post("/add", createTenant);
router.get("/", getTenants);
router.get("/:id", getTenant);
router.put("/:id", updateTenant);
router.delete("/:id", deleteTenant);

module.exports = router;
