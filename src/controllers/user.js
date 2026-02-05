import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {userModel} from "../models/User.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import  ApiResponse  from "../utils/ApiResponse.js";
// passing async function to asyncHandler to handle try-catch internally
const registerUser = asyncHandler(async (req, res) => {
  // Getting user data from req body
  // vaildation
  // check if user already exists
  // check for images
  // upload to cloudinary
  // create user object - create entry in DB
  // remove pass and refresh token field from res when submit to db

  const { fullName, email, username, password } = req.body;

  if (
    !fullName?.trim() ||
    !email?.trim() ||
    !username?.trim() ||
    !password?.trim()
  ) {
    throw new ApiError(400, "All fields are required");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, "Invalid email");
  }

  if (password.length < 6 || !/\d/.test(password)) {
    throw new ApiError(
      400,
      "Password must be at least 6 characters and include a number",
    );
  }

//   finding whether user already exists with given email or username
 const existinguserExist = await userModel.findOne(
   {
    // any one condition can be true
    $or : [
        {email},
        {username}
    ]
   }
  )

  if(existinguserExist){
    throw new ApiError(409,"User already exists with given email or username")
  }
  
//   express gives req.body and multer gives req.files so we can access both of them in controller

// we will get get avatar and cover and we didnt get suppose we will ateast get their path
  const avatarLocalPath = req.files?.avatar[0]?.path
  console.log(avatarLocalPath);
  const coverPhotoLocalPath = req.files?.coverimage[0]?.path
  
//   check whether we got avatar or not because its mandatory and if we dont get it we will throw error and stop the process
  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar dal na bsdk");
  }

  const avatarUrl = await uploadOnCloudinary(avatarLocalPath);
  const coverPhotoUrl = await uploadOnCloudinary(coverPhotoLocalPath);

  if(!avatarUrl){
    throw new ApiError(500,"Tera chutiya Avatar upload failed");
  }
  
//   mongodb har ek entry db meh _id dalta hai
  const user = await userModel.create({
    fullName,
    email,
    username:username.toLowerCase(),
    password,
    avatar: avatarUrl?.url ,
    coverPhoto: coverPhotoUrl?.url || ""

  })
  const createdUser = await userModel.findById(user._id).select("-password -refreshToken")
  if(!createdUser){
    throw new ApiError(500,"Tu matlab User creation failed");
  }
  console.log(createdUser);

  return res.status(201)
  .json( new ApiResponse(201,"User registered successfully",createdUser))

});
export { registerUser };
