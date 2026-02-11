import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const authMiddleware = asyncHandler(async (req,res,next)=>{

    // cookies are stored in req.cookies and headers are stored in req.headers
    const accessToken = req.cookies?.accessToken || req.headers?.authorization?.split(" ")[1];

    if(!accessToken){
        throw new ApiError(401, "Unauthorized user")
    }
    let decoded;
    try{
    decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
    }catch(error){
        throw new ApiError(401,"Unauthorized user")
    }
    // here decoded will have the payload data like _id, username, email, fullname
    req.user = decoded;
    next();
})