const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  orderQuantity: {
    type: Number,
    required: true
  },
  totalPickedQuantity: {
    type: Number,
    required: true,
    default: 0,
    validate: {
      validator: function(v) {
        return v <= this.orderQuantity;
      },
      message: "Total Picked Quantity cannot be greater than Order Quantity."
    }
  },
  batches: [
    {
      batchNumber: { type: String, required: true },
      batchQuantity: { type: Number, required: true },
      pickedQuantity: { type: Number, required: true, default: 0 }
    }
  ]
});

OrderSchema.pre("save", function(next) {
  this.totalPickedQuantity = this.batches.reduce((total, batch) => total + batch.pickedQuantity, 0);
  next();
});

module.exports = mongoose.model("Order", OrderSchema);
