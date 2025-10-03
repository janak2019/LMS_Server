import express from 'express'
import {getAllUsers,registerNewAdmin, registerNewUser} from "../controllers/userControllers.js"
import {isAuthenticated,isAuthorized} from "../middlewares/authMiddleware.js"
import { upload } from '../controllers/multer.Controller.js'

const router = express.Router()

router.get("/all",isAuthenticated,isAuthorized("Admin"),getAllUsers)
//using cloudinary
// router.post(
//     "/add/new-admin",
//     isAuthenticated,
//     isAuthorized("Admin"),
//     registerNewAdmin)
//using multer
router.post("/add/new-admin",
    isAuthenticated,
    isAuthorized("Admin"),upload.single('avatar'), registerNewAdmin);
router.post("/add/new-user",
    isAuthenticated,
    isAuthorized("Admin"),upload.single('avatar'), registerNewUser);

export default router

