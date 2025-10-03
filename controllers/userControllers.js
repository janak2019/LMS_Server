import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { upload } from "./multer.Controller.js";



export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find({ accountVerified: true }).select("-password");

    if (!users || users.length === 0) {
        return res.status(404).json({
            success: false,
            message: "No verified users found",
        });
    }

    res.status(200).json({
        success: true,
        count: users.length,
        users,
    });
});
//usign cloudinary
// export const registerNewAdmin = catchAsyncErrors(async (req, res, next) => {
//   try {
//     // 1. Ensure file upload exists
//     if (!req.files || !req.files.avatar) {
//       return next(new ErrorHandler("Admin avatar is required.", 400));
//     }


//     const { avatar } = req.files;
//     console.log(avatar)

//     // 2. Validate inputs
//     const { name, email, password } = req.body;
//     if (!name?.trim() || !email?.trim() || !password) {
//       return next(new ErrorHandler("Please fill all fields.", 400));
//     }

//     // 3. Check if user already exists
//     const existingUser = await User.findOne({ email, accountVerified: true });
//     if (existingUser) {
//       return next(new ErrorHandler("User already registered.", 400));
//     }

//     // 4. Password length check
//     if (password.length < 8 || password.length > 16) {
//       return next(
//         new ErrorHandler("Password must be between 8 to 16 characters long.", 400)
//       );
//     }

//     // 5. Validate file type
//     const allowedFormats = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
//     if (!allowedFormats.includes(avatar.mimetype)) {
//       return next(new ErrorHandler("File format not supported.", 400));
//     }

//     // 6. Upload to Cloudinary
//     const cloudinaryResponse = await cloudinary.uploader.upload(
//       avatar.tempFilePath,
//       { folder: "LMS" }
//     );

//     if (!cloudinaryResponse?.secure_url) {
//       console.error("Cloudinary upload failed:", cloudinaryResponse);
//       return next(new ErrorHandler("Failed to upload avatar image.", 500));
//     }

//     // 7. Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 8. Create new admin
//     const admin = await User.create({
//       name: name.trim(),
//       email: email.toLowerCase(),
//       password: hashedPassword,
//       role: "Admin",
//       accountVerified: true,
//       avatar: {
//         public_id: cloudinaryResponse.public_id,
//         url: cloudinaryResponse.secure_url,
//       },
//     });

//     // 9. Response
//     res.status(201).json({
//       success: true,
//       message: "Admin registered successfully.",
//       admin,
//     });
//   } catch (error) {
//     console.error("Register Admin Error:", error);
//     return next(new ErrorHandler("Something went wrong. Please try again.", 500));
//   }
// });
//using multer


export const registerNewAdmin = catchAsyncErrors(async (req, res, next) => {
  try {
    // 1. Validate file upload
    if (!req.file) {
      return next(new ErrorHandler("Admin avatar is required.", 400));
    }

    // 2. Validate inputs
    const { email } = req.body;
    if (!email?.trim()) {
      return next(new ErrorHandler("Email is required.", 400));
    }

    // 3. Find existing user (must already be registered as normal user)
    const existingUser = await User.findOne({ email: email.toLowerCase(), accountVerified: true });

    if (!existingUser) {
      return next(new ErrorHandler("User must be registered first before becoming Admin.", 400));
    }

    // 4. Check if already Admin
    if (existingUser.role === "Admin") {
      return next(new ErrorHandler("User is already an Admin.", 400));
    }
    // 4. ✅ Now run multer upload
    // upload.single("avatar")(req, res, async (err) => {
    //   if (err) return next(new ErrorHandler(err.message, 400));
    //   if (!req.file) return next(new ErrorHandler("Admin avatar is required.", 400));
    // })

    // 5. Update user role to Admin and avatar
    existingUser.role = "Admin";
    existingUser.avatar = { url: `/uploads/${req.file.filename}` };

    await existingUser.save();

    // 6. Response
    res.status(200).json({
      success: true,
      message: "User upgraded to Admin successfully",
      admin: existingUser,
    });
  } catch (error) {
    console.error("Register Admin Error:", error);
    return next(new ErrorHandler("Something went wrong. Please try again.", 500));
  }
});
export const registerNewUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, name, password, role } = req.body;

    // 1. Validate required fields
    if (!email?.trim() || !name?.trim() || !password?.trim() || !role?.trim()) {
      return next(new ErrorHandler("Name, email, password and role are required.", 400));
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new ErrorHandler("User with this email already exists.", 400));
    }

    // 3. Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password,
      role, // save role as provided from frontend
      accountVerified: true, // set to true if you want verified by default
    });

    // 4. Save avatar if file uploaded
    if (req.file) {
      newUser.avatar = { url: `/uploads/${req.file.filename}` };
    }

    // 5. Save user to DB
    await newUser.save();

    res.status(201).json({
      success: true,
      message: `User registered successfully as ${role}`,
      user: newUser,
    });
  } catch (error) {
    console.error("Register User Error:", error);
    return next(new ErrorHandler("Something went wrong. Please try again.", 500));
  }
});


