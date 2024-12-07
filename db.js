const mongoose = require("mongoose");

function db() {
  mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
      console.log("MongoDB is connected");
    })
    .catch((error) => {
      console.error("Error in connecting to MongoDB:", error.message);
    });
}

module.exports = db;
