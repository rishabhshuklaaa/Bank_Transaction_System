// Here we run our server on web 

require('dotenv').config();

const app = require("./src/app")
const connectToDB = require("./src/config/db")

//Function call 
connectToDB()

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// app.listen(3000,()=>
// {
//     console.log("Server is running on port 3000")
// })
