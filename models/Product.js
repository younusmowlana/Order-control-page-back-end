const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: false }
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);
