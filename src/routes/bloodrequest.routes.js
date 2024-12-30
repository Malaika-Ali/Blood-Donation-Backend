import { Router } from 'express'
import { createBloodRequest } from '../controllers/bloodrequest.controller.js'
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()

// Create a blood request
router.route("/blood-request").post(verifyJWT,
    upload.single("image"),
    createBloodRequest
)

export default router