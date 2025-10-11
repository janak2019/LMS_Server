import {app} from "./app.js";


app.get("/",(req,res)=>{
    res.status(200).json({
        message:"LMS Server Started"
    })
})

app.listen(process.env.PORT,()=>{
    console.log(`Server is running in port ${process.env.PORT}`)
})


