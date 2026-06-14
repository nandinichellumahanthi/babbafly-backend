const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  getOrdersByUser,
  getOrderById
} = require("../controllers/orderController");

console.log("Order Routes Loaded");

router.post("/", createOrder);

router.get("/", getOrders);

router.get("/user/:userId", getOrdersByUser);

router.get("/:id", getOrderById);

module.exports = router;