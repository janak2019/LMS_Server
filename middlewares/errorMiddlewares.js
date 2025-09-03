class ErrorHandler extends Error{
    constructor(message,statusCode){
        super(message)
        this.statusCode = statusCode;
    }
}

export const errorMiddleware = (err, req, res, next)=>{
    err.message = err.message || "Internal Server Error"
    err.statusCode = err.statusCode || 500
    if(err.code === 11000){
        err.statusCode = 400;
        err.message = "Duplicate field value Entered"
        err = new ErrorHandler(message, statusCode);
    }
    if(err.name === "JsonWebTokenError"){
        err.statusCode = 400;
        err.message = "Duplicate field value entered"
        err = new ErrorHandler(message, statusCode);
      

    }
    if(err.name === "TokenExpiredEror"){
        err.statusCode = 400;
        err.message = "JSON Web Token is expired.Try again."
        err = new ErrorHandler(message, statusCode);      

    }
    if(err.name === "CastEror"){
        err.statusCode = 400;
        err.message = `Resource not found. Invalid: ${err.path}`
        err = new ErrorHandler(message, statusCode);      

    }
    
    const errorMessage = err.errors 
    ? Object.values(err.errors)
        .map((error)=> error.message)
        .join("")
    :err.message;

    return res.status(err.statusCode).json({
        success : false,
        message : errorMessage
    })

}

export default ErrorHandler