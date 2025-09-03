import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true, 
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,       
        required: true,
        min: 0,
    },
    category: { 
        type: String,        
        trim: true
    },
    stock: {
        type: Number,        
        min: 0
    },
    coverImage: {
        public_id: String,
        url: String
    },
    quantity: {
        type: Number,   
        required: true,
        min: 0
    },
    availability: {
        type: Boolean,  
        default: true
    },
   
    
}, {
    timestamps: true    

});
export const Book = mongoose.model("Book", bookSchema);