import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const channelProfile = asyncHandler(async(req,res)=>{
    const channelId = req.params;
    // channel bhi ek user hai
    if(!mongoose.Type.ObjectId.isValid(channelId)){
        throw new ApiError("Channel Not found")
    }
})