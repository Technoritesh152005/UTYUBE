import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
    toggleSubscription,
    getSubscriberCount,
    getSubscribedChannels,
    checkSubscriptionStatus,
} from "../controllers/subscription.js";

const router = Router();

// All subscription routes require authentication except getSubscriberCount
router.route("/toggle/:channelId").post(authMiddleware, toggleSubscription);
router.route("/c/:channelId").get(getSubscriberCount);
router.route("/subscribed-channels").get(authMiddleware, getSubscribedChannels);
router.route("/status/:channelId").get(authMiddleware, checkSubscriptionStatus);

export default router;
