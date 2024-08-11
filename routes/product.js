const Product = require("../models/Product");
const router = require("express").Router();

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// CREATE A NEW PRODUCT
router.post("/", async (req, res) => {
  const { code, name } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const newProduct = new Product({
      code,
      name,
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

module.exports = router;
