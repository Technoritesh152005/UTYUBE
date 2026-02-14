import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
    postComment,
    getVideoComments,
    updateComment,
    deleteComment,
} from "../controllers/comment.js";

const router = Router();

// Video-based routes (videoId in URL)
router
    .route("/video/:videoId")
    .post(authMiddleware, postComment)
    .get(getVideoComments);

// Comment-based routes (commentId in URL)
router
    .route("/:commentId")
    .patch(authMiddleware, updateComment)
    .delete(authMiddleware, deleteComment);

export default router;
