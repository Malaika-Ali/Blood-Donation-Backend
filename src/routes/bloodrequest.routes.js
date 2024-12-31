import { Router } from 'express'
import { createBloodRequest, getDonorsFromNotifications } from '../controllers/bloodrequest.controller.js'
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()

// Create a blood request
router.route("/blood-request").post(verifyJWT,
    upload.single("image"),
    createBloodRequest
)

router.route("/get-donors").get(verifyJWT,
    
    getDonorsFromNotifications
)

// router.get('/get-donors', getDonorsFromNotifications);

export default router