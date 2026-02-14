import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
    toggleLike,
    getLikesCount,
    getLikedVideosOfUser,
} from "../controllers/like.js";

const router = Router();

router.route("/toggle/:videoId").post(authMiddleware, toggleLike);
router.route("/count/:videoId").get(getLikesCount);
router.route("/liked-videos").get(authMiddleware, getLikedVideosOfUser);

export default router;
