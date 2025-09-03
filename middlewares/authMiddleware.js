import jwt from "jsonwebtoken"; 
import{ User } from "../models/userModel.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./errorMiddlewares.js";


export const  isAuthenticated = catchAsyncErrors(async(req,res,next) => {
    const {token} = req.cookies;    
    if(!token){
        return next(new ErrorHandler("User is not authenticated", 401))
    }
    try{
        const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.user = await User.findById(decodedData.id);
        next()
    }catch(error){
        return res.status(401).json({
            success:false,
            message:"Login first to access this resource"
        })
    }
})

export const isAuthorized = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`Role: (${req.user.role}) is not allowed to access this resource`, 403))
        }
        next()
    }
}
    