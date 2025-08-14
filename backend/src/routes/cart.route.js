import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getCart, saveCart } from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/", protectRoute, getCart);
router.post("/", protectRoute, saveCart);

export default router;
