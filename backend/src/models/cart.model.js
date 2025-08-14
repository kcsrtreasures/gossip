import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: String, // Or mongoose.Schema.Types.ObjectId if you reference products
    required: true
  },
  product: String,
  price: Number,
  quantity: Number,
  image: String
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  items: [cartItemSchema]
});

export default mongoose.model("Cart", cartSchema);
