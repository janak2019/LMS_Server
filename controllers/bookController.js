import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { Book } from "../models/bookModel.js";
import { User } from "../models/userModel.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";  


// Add a new book
// Make sure multer middleware is applied in your route to handle 'bookImage'
export const addBook = catchAsyncErrors(async (req, res, next) => {
  const { title, author, description, price, quantity, availability } = req.body;

  if (!title || !author || !description || !price || !quantity) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  try {
    const newBook = new Book({
      title,
      author,
      description,
      price,
      quantity,
      availability: availability !== undefined ? availability : true,
    });

    // If file uploaded, save image URL
    if (req.file) {
      newBook.bookImage = { url: `/uploads/${req.file.filename}` };
    }

    await newBook.save();

    res.status(201).json({
      success: true,
      message: "Book added successfully",
      book: newBook,
    });
  } catch (error) {
    console.error("Add Book Error:", error);
    return next(new ErrorHandler("Internal server error", 500));
  }
});

// Get all books
export const getAllBooks = catchAsyncErrors(async (req, res, next) => {
    try {
        const books = await Book.find();
        res.status(200).json({
            success: true,
            books
        });
    } catch (error) {
        return next(new ErrorHandler("Internal server error", 500));
    }
}); 

// Get a single book by ID
export const getBookById = catchAsyncErrors(async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return next(new ErrorHandler("Book not found", 404));
        }
        res.status(200).json({
            success: true,
            book
        });
    } catch (error) {
        return next(new ErrorHandler("Internal server error", 500));
    }
}); 
// Delete a book by ID
export const deleteBook = catchAsyncErrors(async (req, res, next) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return next(new ErrorHandler("Book not found", 404));
        }
        res.status(200).json({
            success: true,
            message: "Book deleted successfully"
        });
    } catch (error) {
        return next(new ErrorHandler("Internal server error", 500));
    }
});
// // Update a book by ID  
// export const updateBookById = catchAsyncErrors(async (req, res, next) => {
//     try {
//         const { title, author, description, price, quantity} = req.body;
//         const book = await Book.findById(req.params.id);
//         if (!book) {
//             return next(new ErrorHandler("Book not found", 404));
//         }
//         book.title = title || book.title;
//         book.author = author || book.author;
//         book.description = description || book.description;
//         book.price = price || book.price;
//         book.quantity = quantity || book.quantity;
//         await book.save();
//         res.status(200).json({
//             success: true,
//             message: "Book updated successfully",
//             book
//         });
//     } catch (error) {
//         return next(new ErrorHandler("Internal server error", 500));
//     }
// }); 
