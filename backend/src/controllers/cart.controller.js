import Cart from "../models/cart.model.js"; // You'll create this model

// GET /api/cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id; // from protectRoute middleware
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    res.status(200).json(cart.items);
  } catch (err) {
    console.error("Error getting cart:", err);
    res.status(500).json({ message: "Server error while fetching cart" });
  }
};

// POST /api/cart
// controllers/cart.controller.js

export const saveCart = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid cart format" });
    }

    const cart = await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { items: req.body.items.map(item => ({
    productId: item.productId,
    product: item.product,           // ✅ Include name
    price: item.price,
    quantity: item.quantity,
    image: item.image
})) },
      { new: true, upsert: true } // upsert: create if doesn't exist
    );

    res.json(cart);
  } catch (error) {
    console.error("Error saving cart:", error);
    res.status(500).json({ message: "Failed to save cart" });
  }
};

