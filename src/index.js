import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import connectDb from "./db/index.js";
import { app } from "./app.js";   // ✅ import existing app


// ---------------APproach 1:  ------------------
// immdediately invoked function expression
// (async () => {
//   try {
//     const db_connection = await mongoose.connect(
//       `${process.env.DATABASE_URL}/${process.env.DATABASE_NAME}`,
//     );

//     app.listen(process.env.PORT, () => {
//       console.log("server is runnning on port ", process.env.PORT);
//     });
//   } catch (err) {
//     console.log("Error while connecting to db", err);
//   }
// })();

// alwaus whenever need to fetch something from db always put them in try catch block or promise
// also async await


// ---------------APproach 2:  ------------------
connectDb()
.then(()=>{
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log("server is running on port ", PORT);
      } );  
}).catch((err)=>{
    console.log("Failed to connect to DB in index.js", err);
})
