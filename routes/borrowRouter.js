import express from "express";
import { borrowedBooks, getBorrowedBooksForAdmin, recordBorrowedBook, returnBorrowedBook } from "../controllers/borrowController.js";
import { isAuthenticated,isAuthorized } from "../middlewares/authMiddleware.js";


const router = express.Router();
// Route to borrow a book
router.post(
    "/record-borrow-book/:id",
    isAuthenticated,
    isAuthorized("Admin"),
    recordBorrowedBook
);
// Route to get borrowed books for admin
router.get(
    "/borrowed-books-by-users",
     isAuthenticated,     
     getBorrowedBooksForAdmin
    );
// Route to borrow a book by user
router.get(
    "/my-borrowed-books",
     isAuthenticated,
     borrowedBooks
    );
 // Route to return a borrowed book   
router.put(
    "/return-borrowed-book/:id",
     isAuthenticated,
     isAuthorized("Admin"),
     returnBorrowedBook
    );


export default router;