import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { Borrow } from "../models/borrowModel.js";
import { Book } from "../models/bookModel.js";
import { User } from "../models/userModel.js";
import mongoose from "mongoose";
import { calculateFine } from "../utils/fineCalculator.js";

// Get borrowed books for a user
export const borrowedBooks = catchAsyncErrors(async (req, res, next) => {
    const {borrowedBooks} = req.user;   
    
    res.status(200).json({
        success:true,
        borrowedBooks,
    })
})
// Record a borrowed book for a user 
export const recordBorrowedBook = catchAsyncErrors(async (req, res, next) => {
  const {id}  = req.params;   // Book ID
  const { email } = req.body;  // User email
  


  const book = await Book.findById(id);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }

  const user = await User.findOne({ email, accountVerified: true });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Out of stock check
  if (book.quantity <= 0) {
    return next(new ErrorHandler("Book is out of stock", 400));
  }

  // Already borrowed check
  const isAlreadyBorrowed = user.borrowedBooks.find(
    (b) => b.bookId.toString() === id && b.returned === false
  );

  if (isAlreadyBorrowed) {
    return next(new ErrorHandler("You have already borrowed this book", 400));
  }

  // Decrease quantity
  book.quantity -= 1;
  book.availability = book.quantity > 0;
  await book.save();

  // Borrow period (7 days)
  const borrowDate = new Date();
  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Update user borrowedBooks
  user.borrowedBooks.push({
    bookId: book._id,
    borrowedDate: borrowDate,
    dueDate: dueDate,
    returned: false,
  });
  await user.save();

  // Create Borrow record
  await Borrow.create({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    book: book._id,
    price: book.price,
    borrowDate,
    dueDate,
    // ❌ don’t set returnDate here yet, since not returned
  });

  res.status(200).json({
    success: true,
    message: "Book borrowed successfully",
  });
});
     

// Get all borrowed books for admin
export const getBorrowedBooksForAdmin = catchAsyncErrors(async (req, res, next) => {
    const borrowedBooks = await Borrow.find(); 
    
    res.status(200).json({
        success:true,
        borrowedBooks,
    })     
})
// Return a borrowed book
export const returnBorrowedBook = catchAsyncErrors(async (req, res, next) => {
    const {id}  = req.params;   // Borrow ID
    console.log(id)
    const {email} = req.body; // User email
    const book = await Book.findById(id)
    if(!book){
        return next(new ErrorHandler("Book not found",404))
    }
    const user = await User.findOne({email:email, accountVerified:true})
    if(!user){  
        return next(new ErrorHandler("User not found",404))
    }
    const borrowedBook = user.borrowedBooks.find(
        (b) => b.bookId.toString() === id && b.returned === false
    );  
    if (!borrowedBook) {
        return next(new ErrorHandler("This book is not currently borrowed by the user", 400));
    }   
    borrowedBook.returned = true; // Mark as returned
    await user.save();
    book.quantity += 1;  //
    book.availability = book.quantity > 0; // Book is now available again
    await book.save();
    const borrow = await Borrow.findOne({
        "book": book.id,
        "user.email": email,
        "returnDate": null  
    });
    if(!borrow){
        return next(new ErrorHandler("Borrow record not found",404))
    }   
    borrow.returnDate = new Date();

    // Calculate fine if returned late
    const fine = calculateFine(borrow.dueDate)
    borrow.fine = fine;     
    await borrow.save();
  

    res.status(200).json({
        success: true,
        message: 
        fine !==0 
        ? `Book returned successfully. The total charges, including a fine, are Rs.${fine+ book.price}`
        : `The book return successfully. The total charges are Rs${book.price}`,
        
    });     
})