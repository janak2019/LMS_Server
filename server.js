import {app} from "./app.js";

import cloudinary from './utils/cloudinary.js'

app.get("/",(req,res)=>{
    res.status(200).json({
        message:"Hello From LMS"
    })
})

app.listen(process.env.PORT,()=>{
    console.log(`Server is running in port ${process.env.PORT}`)
})


