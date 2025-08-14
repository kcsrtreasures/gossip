import express from "express";
import { getMessages, getUsersForSidebar, sendMessage, unsendMessage } from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router()


router.get("/users", protectRoute, getUsersForSidebar)
router.get("/:id", protectRoute, getMessages)

router.post("/send/:id", protectRoute, sendMessage)

router.put("/unsend/:id", protectRoute, unsendMessage);

export default router;