import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt"
import crypto from "crypto"
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateForgetPasswordEmailTemplate } from "../utils/emailTemplate.js";


// Register User
export const register = catchAsyncErrors(async(req, res, next)=>{
    try{
        const {name, email, password} = req.body;
        if(!name || !email || !password){
            return next(new ErrorHandler("Please enter all fields", 400))
        }
        const isRegistered = await User.findOne({email,accountVerified: true} )
        if(isRegistered){
            return next(new ErrorHandler("User already exist", 409))
        }  
        const registrationAttemptByUser = await User.find({
            email,
            accountVerified: false
        })
        if(registrationAttemptByUser.length >= 5){
            return next(new ErrorHandler("You have exceeded the number of registration attempts. Please try again later.", 429))
        }
        if(password.length < 6){
            return next(new ErrorHandler("Password must be between 8 and 16 characters", 400))
        }    
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })
        const verificationCode = await user.generateVerificationCode()  
              const verificationToken = crypto.randomBytes(20).toString("hex")
              await user.save()
              sendVerificationCode(verificationCode, email, res)
                  
    }catch(error){
        return next(error)   
    }
})

// verify otp
export const verifyOTP  = catchAsyncErrors(async(req, res, next)=>{
    const {email, otp} = req.body;
    if(!email || !otp){
        return next(new ErrorHandler("Please provide all fields", 400))
    }
    try{
        const userAllEntries = await User.find({
            email, 
            accountVerified:false
        }).sort({createdAt:-1})

        if (!userAllEntries || userAllEntries.length === 0) {
                return next(new ErrorHandler("User not found", 400));
            }

        let user;
        if(userAllEntries.length >1 ){
            user = userAllEntries[0]
            await User.deleteMany({
                _id:{$ne: user._id},
                email,
                accountVerified:false
            }) 
        }else{
            user = userAllEntries[0]    
                      
        }
        if(user.verificationCode !== Number(otp)){
            return next(new ErrorHandler("Invalid OTP", 400))
        }
        const currentTime = new Date();
        const verificationCodeExpire = new Date(
            user.verificationCodeExpire
        ).getTime()
        
        if(currentTime.getTime() > verificationCodeExpire){
            return next(new ErrorHandler("OTP has expired", 400))
        }
        user.accountVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpire = null; 
        await user.save({validateModifiedOnly: true})
        sendToken(user, 200,"Account Verified", res)

    }catch(error){
        return next(new ErrorHandler("Internal server error", 500))
    }   
})

// Login User
export const login = catchAsyncErrors(async(req, res, next)=>{
    const {email, password} = req.body;
    if(!email || !password){
        return next(new ErrorHandler("Please enter email and pasword", 400))
    }
    const user = await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandler("Invalid email or password", 401))
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password", 401))
    }
    if(!user.accountVerified){
        return next(new ErrorHandler("Please verify your account first", 403))
    }
    sendToken(user, 200, "Login successful", res)
})


// Logout User
export const logout = catchAsyncErrors(async(req, res, next)=>{
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    sameSite: "strict",
    secure: false, // change to true in production
  })
    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    })
}) 

//
export const getUser = catchAsyncErrors(async(req, res, next)=>{
    const user = req.user
    if(!user){
        return next(new ErrorHandler("User not found", 404))
    }
    res.status(200).json({
        success: true,
        user
    })
})

// Forgot Password
export const forgotPassword = catchAsyncErrors(async(req, res, next)=>{
   if(!req.body.email){
        return next(new ErrorHandler("Please provide your email", 400))
    }
    const user = await User.findOne({
        email: req.body.email,
        accountVerified: true
    });
    if(!user){
        return next(new ErrorHandler("User not found", 404))
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave: false})   
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
    const message = generateForgetPasswordEmailTemplate(resetPasswordUrl)
    try{
        await sendEmail({
            email: user.email,
            subject: `Library Management System Password Recovery`,
            message,
        })
        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        })      
    }catch(error){
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined;
        await user.save({validateBeforeSave: false})
        return next(new ErrorHandler(error.message, 500))
    }
})

// Reset Password
export const resetPassword = catchAsyncErrors(async(req, res, next)=>{
    
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    })
    if(!user){
        return next(new ErrorHandler("Reset password token is invalid or has been expired", 400))
    }
    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match", 400))
    }
    if(req.body.password.length < 6 || req.body.password.length > 16 || req.body.confirmPassword.length < 6 || req.body.confirmPassword.length > 16){
        return next(new ErrorHandler("Password must be between 8 and 16 characters", 400))
    }
    user.password = await bcrypt.hash(req.body.password, 10)
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save();
    sendToken(user, 200, "Password changed successfully", res)
}) 
// Update Password
export const updatePassword = catchAsyncErrors(async(req, res, next)=>{
    
    const user = await User.findById(req.user._id).select("+password");  
    const {oldPassword, newPassword, confirmPassword} = req.body;
    if(!oldPassword || !newPassword || !confirmPassword){
        return next(new ErrorHandler("Please provide all fields", 400))
    }
    if(!user){
        return next(new ErrorHandler("User not found", 404))
    }   
    const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Old password is incorrect", 400))
    }
    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match", 400))
    }
    if(req.body.newPassword.length < 6 || req.body.newPassword.length > 16 || req.body.confirmPassword.length < 6 || req.body.confirmPassword.length > 16){
    return next(new ErrorHandler("Password must be between 8 and 16 characters", 400))
    }   
    user.password = await bcrypt.hash(req.body.newPassword, 10)
    await user.save();
    sendToken(user, 200, "Password updated successfully", res)
})