import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { commentModel } from "../models/comment.js";
import mongoose from "mongoose";

export const postComment = asyncHandler(async (req, res) => {
    // to post comment we need videoid, userid and its content
    const userId = req.user._id;
    const { videoId } = req.params;
    const { content } = req.body;

    if (!userId) {
        throw new ApiError("User not found to comment or not Authenticated")
    }
    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }
    if (!content?.trim()) {
        throw new ApiError(400, "Comment content is required");
    }

    const comment = await commentModel.create(
    {
        commentContent: content,
        commentedUser: userId,
        commentedVideo: videoId
        }, {
        timestamps: true
    }
    )
    if (!comment) {
        throw new ApiError(401, "Failed to post Comment")
    }

    return res.status(200)
        .json(new ApiResponse(201, "Comment succesfully posted", comment))
})

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const comments = await commentModel
        .find({ commentedVideo: videoId })
        .populate("commentedUser", "fullname avatar username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const totalComments = await commentModel.countDocuments({ commentedVideo: videoId });
    const totalPages = Math.ceil(totalComments / limit);

    return res.status(200).json(
        new ApiResponse(200, "Comments fetched successfully", {
            comments,
            pagination: {
                page,
                limit,
                totalComments,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        })
    );
});

const updateComment = asyncHandler(async (req, res) => {
    // ek comment box ka id
    const { commentId } = req.params;
    const { content } = req.body;
    console.log(commentId)
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }
    if (!content?.trim()) {
        throw new ApiError(400, "Content is required to update comment");
    }

    const comment = await commentModel.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    if (comment.commentedUser.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own comments");
    }

    const updatedComment = await commentModel.findByIdAndUpdate(
        commentId,
        { $set: { commentContent: content } },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, "Comment updated successfully", updatedComment));
});


const deleteComment = asyncHandler(async(req,res)=>{

    // to get delete a comment u need a comment box and each box has its id
    // u need  to also verify that commentbox owner === req.user
    const {commentId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(401, "Failed to get this commentId to delete comment")
    }

    const commentDoc = await commentModel.find(commentId) 
    if(!commentDoc){
        throw new ApiError(401,"Didnt get comment to delete the comment")
    }

    if(commentDoc.commentedUser.toString() !== req.user._id){
        throw new ApiError(400, "You r not authorized to delete this comment")
    }
    const commentDeleted = await commentModel.findByIdAndDelete(commentId)

    if(!commentDeleted){
        throw new ApiError(400,"Failed to delete comment")
    }

    return res.status(200)
    .json(new ApiResponse(201,"Comment Deleted Succesfully"))

})



export { postComment, getVideoComments, updateComment, deleteComment };