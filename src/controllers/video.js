import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { videoModel } from "../models/video.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const uploadVideoInYoutube = asyncHandler( async(req,res)=>{

    // pick the first field from the array in req.files object
    // first check whether we got video file or not
    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if(!videoLocalPath){
        throw new ApiError(401,"Video file is missing");
    }
    if(!thumbnailLocalPath){
        throw new ApiError(401,"Thumbnail file is missing")
    }

    const { title, description, ispublic } = req.body;

    if (!title?.trim()) {
        throw new ApiError(400, "Title is required");
    }
    if (!description?.trim()) {
        throw new ApiError(400, "Description is required");
    }
    if(ispublic !== true && ispublic !== false){
        throw new ApiError(401,"ispublic must be a boolean");
    }

    const video = await uploadOnCloudinary(videoLocalPath)
    if(!video){
        throw new ApiError(500," Failed to upload video to cloudinary")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnail){
        throw new ApiError(500, "Failed to upload thumbnail to cloudinary")
    }
    await videoModel.create({
        _id: new mongoose.Types.ObjectId(),
        videoFile: video.secure_url,
        videoFilePublicId: video.public_id,
        duration: video.duration,
        description: description,
        ispublic: ispublic,
        title: title,
        thumbnail: thumbnail.secure_url,
        thumbnailPublicId: thumbnail.public_id,
        videoowner: req.user._id,
        views: 0,
    })
    // publicId is given by cloudinary which is a extra asset or iddentiffier for that multimedia files
    return res.status(201)
    .json(new ApiResponse(201, "Video uploaded successfully", video))
})

const getVideoById = asyncHandler (async(req,res)=>{

    const {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(400, "Invalid video ID");
    }
    const searchedVideo = videoModel.findById(id)
    if(!searchedVideo){
        throw new ApiError(404, "Video Not found ")
    }
    return res.status(200)
    .json(new ApiResponse(200, "Video fetched successfully", searchedVideo));
})

const getAllVideos = asyncHandler (async(req,res)=>{
    const allVideo = await videoModel.find({})

    return res.status(200)
    .json(new ApiResponse(200, "All videos fetched successfully", allVideo));
})

const updateVideo = asyncHandler(async (req, res) => {

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await videoModel.findById(id);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (video.videoowner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own videos");
    }

    const { title, description, ispublic } = req.body;

    if (!title?.trim()) {
        throw new ApiError(400, "Title is required");
    }
    if (!description?.trim()) {
        throw new ApiError(400, "Description is required");
    }
    // form-data sends string; allow both boolean and "true"/"false"
    const isPublic = ispublic === true || ispublic === "true";

    const updateFields = { title, description, ispublic: isPublic };

    // If user sent a new thumbnail file (multer puts it in req.file for single upload)
    if (req.file?.path) {
        const thumbnail = await uploadOnCloudinary(req.file.path);
        if (thumbnail) {
            updateFields.thumbnail = thumbnail.secure_url;
        } else {
            throw new ApiError(500, "Failed to upload thumbnail to Cloudinary");
        }
    }

    const updatedVideoDetails = await videoModel.findByIdAndUpdate(

        id,
        { $set: updateFields },
        { new: true }
    );

    if (!updatedVideoDetails) {
        throw new ApiError(400, "Failed to update video details");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Video details updated successfully", updatedVideoDetails));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await videoModel.findById(id);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (req.user._id.toString() !== video.videoowner.toString()) {
        throw new ApiError(403, "You can only delete your own videos");
    }

    // Delete from Cloudinary if public_ids are stored
    if (video.videoFilePublicId) {
        await deleteFromCloudinary(video.videoFilePublicId, "video");
    }
    if (video.thumbnailPublicId) {
        await deleteFromCloudinary(video.thumbnailPublicId, "image");
    }

    const videoDeletedInDb = await videoModel.findByIdAndDelete(id);
    if (!videoDeletedInDb) {
        throw new ApiError(500, "Failed to delete video");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Video deleted successfully"));
})



export { uploadVideoInYoutube, getVideoById, updateVideo, getAllVideos, deleteVideo };

