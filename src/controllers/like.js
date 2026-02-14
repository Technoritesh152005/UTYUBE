import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { likeModel } from "../models/like.js";
import mongoose from "mongoose";

// toggle like means if user likes the video then it will be removed and if user unlikes the video then it will be added
// it is one button means if user likes the video then unlike will be removed and if user unlikes the video then like will be added
const toggleLike = asyncHandler(async(req,res)=>{

    const {videoId} = req.params
    const userId = req.user._id

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid Video Id")
    }

    // check if like exists
    // it checks whether user has liked the video or not
    // it returns the like document if it exists also array
    const existingLike = await likeModel.findOne(
        {
            likedVideo: videoId,
            likedBy: userId
        }
    )
    console.log(existingLike)
    // existing like return object if it exists otherwise null
    // means user has liked the video
    // means like is already there so we need to remove it
    if(existingLike){
       await likeModel.findByIdAndDelete( existingLike._id)
       return res.status(200).json(new ApiResponse(200, "Like removed successfully", { liked: false }))
    }else{
        await likeModel.create({
            likedVideo: videoId,
            likedBy: userId
        })
        return res.status(200)
        .json(new ApiResponse(200,"Like added succesfully",{liked:true} ))
    }
   
})

const getLikesCount = asyncHandler(async(req,res)=>{
     const {videoId} = req.params;
     if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(401,"Invalid Video Id")
     }
    //  countDocuments() returns how many documents in a collection match a given filter.
    // find return array of matching document but countDocuments returns number of matching documents

     const likesCount = await likeModel.countDocuments(
        {
            likedVideo: videoId
        }
     )
     if(likesCount === 0){
        return res.status(200).json(new ApiResponse(200,"No likes found",{likesCount:0}))
     }
     return res.status(200).json(new ApiResponse(200,"Likes count fetched",{likesCount}))
})

const getLikedVideosOfUser = asyncHandler(async(req,res)=>{
    const userId = req.user._id
    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(401,"Invali user Id in getting liked videos")
    }

    // u could have used countDocuments but it retunr only cout
    // but find return array of matching documents
    // mainly likedVideos returns array of like documents having userId as likedBy
    // and populate is used to populate the likedVideo field with the title and thumbnail of the video
    const likedVideos = await likeModel.find(
        {
            likedBy: userId
        }
        .populate( "likedVideo" , "title thumbnail duration ")
    )

    if(!likedVideos){
        throw new ApiError(400,"Problem to fetch uour liked Videos")
    }

    return res.status(200).
    json(new ApiResponse(201,"Liked videos of user fetched Successfully", likedVideos))
})

export {toggleLike, getLikesCount, getLikedVideosOfUser}

// existingLike lya check karta hai ki vow video me user ka like hai ya nahi
// agar video meh us user ka like hai toh user mostly usko delete karna chahyega ya existingLike nhi hai toh like krna chayega