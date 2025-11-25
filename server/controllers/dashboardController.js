const Tenant = require("../models/Tenant");
const Lease = require("../models/Lease");
const Maintenance = require("../models/Maintenance");
const Property = require("../models/Property");

exports.getDashboardStats = async (req, res) => {
  try {
    // 📌 BASIC COUNTS
    const totalProperties = await Property.countDocuments();
    const activeTenants = await Tenant.countDocuments({ active: true });
    const activeLeases = await Lease.countDocuments({ status: "Active" });
    const maintenanceOpen = await Maintenance.countDocuments({ status: "Pending" });

    // 📌 MONTHLY RENT COLLECTED (sum of active lease rentAmount)
    const leases = await Lease.find({ status: "Active" }).lean();
    const monthlyRentCollected = leases.reduce((sum, l) => sum + (l.rentAmount || 0), 0);

    // 📌 MONTHLY TRENDS (static sample or future DB based)
    const trends = [
      { month: "Jan", rent: 120000 },
      { month: "Feb", rent: 95000 },
      { month: "Mar", rent: 125000 },
      { month: "Apr", rent: 110000 },
      { month: "May", rent: 98000 },
      { month: "Jun", rent: 135000 },
    ];

    // 📌 RECENT ACTIVITY (sample or fetch from logs later)
    const recentActivity = [
      { title: "Lease Created: Rahul → Greenfield Apt", time: "2 hours ago" },
      { title: "Maintenance: Pipe fixed", time: "1 day ago" },
      { title: "New Tenant: Priya Sharma", time: "2 days ago" },
      { title: "New Property Added: Sea-view Penthouse", time: "3 days ago" }
    ];

    // 📌 SEND RESPONSE
    res.json({
      totalProperties,
      activeLeases,
      activeTenants,
      maintenanceOpen,
      monthlyRentCollected,
      trends,
      recentActivity,
    });
} catch (error) {
  console.error("Dashboard API Error:", error.message);
  console.error("Full error:", error);
  res.status(500).json({ error: error.message });
}

};
