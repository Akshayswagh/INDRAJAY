const express = require("express");
const verifyToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const router = express.Router();

// only admin can  access these Routes
router.get("/admin", verifyToken, authorizeRoles("admin"), (req, res) => {
  res.json({ messgae: "welcome Admin" });
});

// both admin & venders can  access these Routes
router.get(
  "/vender",
  verifyToken,
  authorizeRoles("admin", "vender"),
  (req, res) => {
    res.json({ messgae: "welcome vender" });
  }
);

// all can  access these Routes (admin, users, users)
// router.get(
//   "/user",
//   verifyToken,
//   authorizeRoles("admin", "vender", "user"),
//   (req, res) => {
//     res.json({ messgae: "welcome user" });
//   }
// );

module.exports = router;
