export function generateVerificationOtpEmailTemplate(otp) {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px; text-align: center;">
  <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 25px;">
    
    <h2 style="color: #4CAF50; margin-top: 0;">Your Verification Code</h2>
    
    <p style="color: #333; font-size: 16px; margin: 10px 0;">Dear User,</p>
    <p style="color: #555; font-size: 15px; margin: 10px 0;">
      Thank you for registering with us. Your verification code is:
    </p>
    
    <div style="margin: 20px 0; padding: 15px; background: #f0fff4; border: 1px solid #4CAF50; border-radius: 8px;">
      <h1 style="font-size: 2.2em; color: #4CAF50; margin: 0;">${otp}</h1>
    </div>

    <!-- Responsive Button -->
    <a href="#" 
       style="display: inline-block; width: 100%; max-width: 250px; padding: 14px 20px; background-color: #4CAF50; 
              color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px; margin-top: 10px;">
      Verify Now
    </a>
    
    <p style="color: #555; font-size: 15px; margin: 20px 0 10px;">
      Please enter this code or click the button above to verify your account.
    </p>
    <p style="color: #999; font-size: 14px; margin: 10px 0;">
      If you did not request this code, please ignore this email.
    </p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #333; font-size: 14px; margin: 5px 0;">Best regards,</p>
    <p style="color: #4CAF50; font-weight: bold; font-size: 15px;">The Library Management System Team</p>
  
  </div>
</div>
 `     
}

export function generateForgetPasswordEmailTemplate(resetUrl) {
    return `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px; text-align: center;">
    <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 25px;">
      
      <h2 style="color: #FF5722; margin-top: 0;">Password Reset Request</h2>
      
      <p style="color: #333; font-size: 16px; margin: 10px 0;">Dear User,</p>
      <p style="color: #555; font-size: 15px; margin: 10px 0;">
        We received a request to reset your password. Click the button below to reset it:
      </p>
      
      <a href="${resetUrl}" 
         style="display: inline-block; width: 100%; max-width: 250px; padding: 14px 20px; background-color: #FF5722; 
                color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px; margin-top: 10px;">
        Reset Password
      </a>
      
      <p style="color: #555; font-size: 15px; margin: 20px 0 10px;">
        If you did not request a password reset, please ignore this email or contact support if you have questions.
      </p>
      <p style="color: #999; font-size: 14px; margin: 10px 0;">
        This link will expire in 30 minutes.
      </p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #333; font-size: 14px; margin: 5px 0;">Best regards,</p>
      <p style="color: #FF5722; font-weight: bold; font-size: 15px;">The Library Management System Team</p>
    
    </div>
  </div>
   `     
}