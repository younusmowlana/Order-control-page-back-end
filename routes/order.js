const Order = require("../models/Order");
const Product = require("../models/Product");

const router = require("express").Router();

//get orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().populate("product");
    console.log("orders-->",orders)

    const response = orders.map((order) => {
      return {
        product_code: order.product.code,
        order_quantity: order.orderQuantity,
        picked_quantity: order.totalPickedQuantity,
        batch_quantity: order.batches.reduce(
          (total, batch) => total + batch.batchQuantity,
          0
        ),
      };
    });

    res.json(response);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//create orders
router.post("/", async (req, res) => {
  const { productId, orderQuantity, batches } = req.body;

  if (!productId || !orderQuantity || !batches || !Array.isArray(batches)) {
    return res
      .status(400)
      .json({ message: "Missing required fields or invalid data" });
  }

  try {
    const totalPickedQuantity = batches.reduce(
      (total, batch) => total + batch.pickedQuantity,
      0
    );

    const newOrder = new Order({
      product: productId,
      orderQuantity,
      totalPickedQuantity,
      batches,
    });

    await newOrder.save();

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

module.exports = router;
