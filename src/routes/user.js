import {Router} from 'express';
import { registerUser } from '../controllers/user.js';
import {upload} from "../middleware/multer.js";
import {authMiddleware} from "../middleware/authMiddleware.js";
import { loginUser, refreshAccessToken, logoutUser, forgotPassword, updateAccountDetails, updateUserAvatar } from "../controllers/user.js";

const router = Router();

router.route("/register")
.post(
    upload.fields(
        [
            {
                name:"avatar",
                maxCount:1
            },
            {
                name:"coverimage",
                maxCount:1
            }
        ]
    ),
    registerUser
);

router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/logout").post(authMiddleware, logoutUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/update-account").patch(authMiddleware, updateAccountDetails);
router.route("/avatar").patch(authMiddleware, upload.single("avatar"), updateUserAvatar);

export default router;