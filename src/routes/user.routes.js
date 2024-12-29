import { Router } from 'express'
// import {  loginUser, logoutUser, refreshAcccessToken, registerUser } from '../controllers/user.controller.js'
import {  registerUser } from '../controllers/user.controller.js'

import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()

router.route("/register").post(
    registerUser
)


// Login Route
// router.route('/login').post(loginUser)


// secured routes
// router.route("/logout").post(verifyJWT, logoutUser)
// router.route("/refresh-token").post(refreshAcccessToken)

// router.route("/change-password").post(verifyJWT, changeCurrentPassword)
// router.route("/current-user").get(verifyJWT, getCurrentUser)
// router.route("/update-account").patch(verifyJWT, updateAccountDetails)
// router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
// router.route("/update-cover-image").patch(verifyJWT, upload.single("coverImage"), updateUsercoverImage)
// router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
// router.route("/history").get(verifyJWT, getWatchHistory)


export default router