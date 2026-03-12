// Here we run our server on web 

require('dotenv').config();

const app = require("./src/app")
const connectToDB = require("./src/config/db")

//Function call 
connectToDB()
app.listen(3000,()=>
{
    console.log("Server is running on port 3000")
})
