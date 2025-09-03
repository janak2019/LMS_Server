import { sendEmail } from "./sendEmail.js"
import { generateVerificationOtpEmailTemplate } from "./emailTemplate.js"
import express from "express"
export async function sendVerificationCode( verificationCode, email, res){
    
    try{
        const message = generateVerificationOtpEmailTemplate(verificationCode)
        
        
        sendEmail({
            email,
            subject:"Verification Code(Library Management System) ",            
            message ,
    })
    res.status(200).json({
        success:true,       
        message:"Verification code sent to your email"
    })

        
    
    }catch(error){
        res.status(500).json({
            success:false,
            message:"Failed to send verification code. Please try again later."
        })
    }
}