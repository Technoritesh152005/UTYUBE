import {Router} from 'express';
import { registerUser } from '../controllers/user.js';
import { upload, uploadVideo } from "../middleware/multer.js";
import {authMiddleware} from "../middleware/authMiddleware.js";
import {
  uploadVideoInYoutube,
  updateVideo,
  deleteVideo,
} from "../controllers/video.js";


import {
  loginUser,
  refreshAccessToken,
  logoutUser,
  forgotPassword,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getCurrentUser,
  changeUserPassword,
} from "../controllers/user.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverimage", maxCount: 1 },
  ]),
  registerUser
);


router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/logout").post(authMiddleware, logoutUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/update-account").patch(authMiddleware, updateAccountDetails);
router.route("/current-user").get(authMiddleware, getCurrentUser);
router.route("/change-password").post(authMiddleware, changeUserPassword);
router.route("/avatar").patch(authMiddleware, upload.single("avatar"), updateUserAvatar);
router
  .route("/cover-image")
  .patch(authMiddleware, upload.single("coverimage"), updateUserCoverImage);
  router
  .route("/upload-video")
  .post(
    authMiddleware,
    // req.files will have videoFile and thumbnail
    uploadVideo.fields([
      { name: "videoFile", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    uploadVideoInYoutube
  );
router
  .route("/:videoId")
  .patch(authMiddleware, upload.single("thumbnail"), updateVideo)
  .delete(authMiddleware, deleteVideo);

export default router;