const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Product = require("../models/Product");
const cs = require("fs").promises;

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 
    },
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

router.use('/uploads', express.static(path.join(__dirname, 'uploads')));

router.post("/", upload.array("images", 5), async (req, res) => {
    try {
        const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
        const productData = {
            productCode: req.body.productCode,
            productName: req.body.productName,
            description: req.body.description,
            price: parseFloat(req.body.price),
            stockQuantity: parseInt(req.body.stockQuantity),
            category: req.body.category,
            brand: req.body.brand,
            isActive: req.body.isActive === 'true',
            images: imagePaths
        };
        const product = new Product(productData);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        if (req.files) {
            req.files.forEach(file => {
                fs.unlink(file.path, err => {
                    if (err) console.error('Error deleting file:', err);
                });
            });
        }
        res.status(400).json({ error: error.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const products = await Product.find();

        const updatedProducts = await Promise.all(products.map(async (product) => {
            const imagesBase64 = await Promise.all(product.images.map(async (imgPath) => {
                try {
                    // Adjust the file path to match actual storage
                    const filePath = path.join(__dirname, "uploads", path.basename(imgPath));

                    // Check if file exists before reading
                    await fs.promises.access(filePath);

                    // Read the image file and convert to Base64
                    const imageBuffer = await fs.promises.readFile(filePath);
                    return `data:image/${path.extname(filePath).slice(1)};base64,${imageBuffer.toString('base64')}`;
                } catch (err) {
                    console.error("Error reading file:", err);
                    return null;
                }
            }));

            return {
                ...product.toObject(),
                images: imagesBase64.filter(img => img !== null) // Remove null values
            };
        }));

        res.json(updatedProducts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




// Get a single product by ID
router.get("/:id", async (req, res) => {
  try {
      const product = await Product.findById(req.params.id);
      if (!product) {
          return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Update a product by ID
router.put("/:id", async (req, res) => {
  try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!product) {
          return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
});

// Delete a product by ID
router.delete("/:id", async (req, res) => {
  try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
          return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

module.exports = router;
