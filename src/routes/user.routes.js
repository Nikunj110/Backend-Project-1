import { Router } from "express";
import { loginUser, logOutUser, registerUser,refreshAccessToken } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
// aapde aaya middle ware add karsu registerUser pela 
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser);

// have aagals /register lagse atle registerUser call thase so pachi te file ma jase controller vali

router.route("/login").post(loginUser)

// secured route
router.route("/logout").post(verifyJWT,logOutUser );
router.route("/refresh-token").post(refreshAccessToken)

export default router;