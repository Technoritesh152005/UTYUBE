import {Router} from 'express';
import { registerUser } from '../controllers/user.js';
import {upload} from "../middleware/multer.js";
import {authMiddleware} from "../middleware/authMiddleware.js";
import {loginUser} from "../controllers/user.js"
import {logoutUser} from "../controllers/user.js";

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

router.route("/login").post(loginUser)
router.route("/logout").post(authMiddleware,logoutUser)


export default router;