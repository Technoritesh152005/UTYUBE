import mongoose from "mongoose";    
import { Rk_Db   } from "../constants.js";

const connectDb = async function db_connection(){

    try{

        const db_connect = await mongoose.connect(process.env.DATABASE_URL  );
        console.log("Connected to DB: ", Rk_Db );
        console.log(db_connect.connection.host);

    }catch(err){    
        console.log("Error while connecting to db", err);
        // immediately exit the process if db connection fails
        process.exit(1)
    }
}

export default connectDb;