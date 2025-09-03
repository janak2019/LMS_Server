import express from "express";
import { getUser, login, logout, register, verifyOTP,forgotPassword, resetPassword, updatePassword} from "../controllers/authController.js";
import { verify } from "crypto";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
const router = express.Router();
router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.get("/logout",isAuthenticated, logout);
router.get("/user",isAuthenticated, getUser);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);
router.put("/password/update",isAuthenticated, updatePassword);


router.get("/me", isAuthenticated, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});


export default router;
// This file defines the authentication routes for user registration.