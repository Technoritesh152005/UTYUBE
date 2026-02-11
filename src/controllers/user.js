import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {userModel} from "../models/user.js";

import {uploadOnCloudinary} from "../utils/cloudinary.js";
import  ApiResponse  from "../utils/ApiResponse.js";
import fs from "fs";




// passing async function to asyncHandler to handle try-catch internally
const registerUser = asyncHandler(async (req, res) => {



  // Getting user data from req body
  // vaildation
  // check if user already exists
  // check for images
  // upload to cloudinary
  // create user object - create entry in DB
  // remove pass and refresh token field from res when submit to db

  const { fullname, email, username, password } = req.body;

  if (
    !fullname?.trim() ||
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
  // const coverPhotoLocalPath = req.files?.coverimage[0]?.path
  
  let coverPhotoLocalPath;
  if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length>0){
    coverPhotoLocalPath = req.files.coverimage[0].path
  }
//   check whether we got avatar or not because its mandatory and if we dont get it we will throw error and stop the process
  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar dal na bsdk");
  }
  

 const avatarUrl = await uploadOnCloudinary(avatarLocalPath);

if (!avatarUrl) {
  throw new ApiError(500, "Avatar upload failed");
}

let coverPhotoUrl = null;
if (coverPhotoLocalPath) {
  coverPhotoUrl = await uploadOnCloudinary(coverPhotoLocalPath);
}

  
//   mongodb har ek entry db meh _id dalta hai
  const user = await userModel.create({
    fullname,
    email,
    username:username.toLowerCase(),
    password,
    avatar: avatarUrl?.secure_url || "",
    coverimage: coverPhotoUrl?.secure_url || ""

  })
  const createdUser = await userModel.findById(user._id).select("-password -refreshtoken")
  if(!createdUser){
    throw new ApiError(500,"Tu matlab User creation failed");
  }
  console.log(createdUser);
  

  return res.status(201)
  .json( new ApiResponse(201,"User registered successfully",createdUser))

});

const loginUser = asyncHandler(async (req,res)=>{
  

  // first take username and other data from req.body
  // check whether they exist in db by findOne
  // check if password is correct by isPasswordMatch
  // generate access token and refresh token
  // send response

 const {email,password,username} = req.body || {};

 if(!email || !password){
  throw new ApiError(400,"Email and password are required");
 }
 const userlogin = await userModel.findOne({
  $or: [
    {email},
     {username: username?.toLowerCase()}
    ]
  })

 if(!userlogin){
  throw new ApiError(401,"Invalid email or password");
 }
 const isPasswordMatch = await userlogin.isPasswordMatch(password);

if(!isPasswordMatch){
  throw new ApiError(401,"Invalid email or password");
}

const accessToken = await userlogin.generateAccessToken();
const refreshToken = await userlogin.generateRefreshToken();

// saving refresh token to database
userlogin.refreshtoken = refreshToken;
await userlogin.save({validateBeforeSave: false });

const options={
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
}

// for cookies we use cookie-parser middleware and need to pass options to set cookies and accessToken and refreshToken are the names of the cookies
return res.status(200)
.cookie("accessToken", accessToken, options)
.cookie("refreshToken", refreshToken, options)
.json( new ApiResponse(200,"Login successful",{accessToken, refreshToken}));wh

// send cookies to client



})

const logoutUser = asyncHandler(async (req, res) => {
  
  const id = req.user?._id;
  if (!id) {
    throw new ApiError(401, "Unauthorized user");
  }

  // Remove refresh token from DB
  await userModel.findByIdAndUpdate(id, {
    $set: { refreshtoken: null },
  });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "Logged out successfully", {}));
});

export { registerUser ,loginUser , logoutUser};


// Cookie: a small piece of data that the browser stores and automatically sends with every request to your server for that domain.
// It’s just key–value pairs, e.g. sessionId=abc123.
// You set it from the backend with something like:
//   res.cookie("accessToken", token, { httpOnly: true, secure: true });
// Uses:
// Remember who the user is (auth/session).
// Store small preferences (language, theme, etc.).
// For auth, we usually use HTTP‑only cookies so:
// JavaScript cannot read them (protects against XSS).
// Browser still sends them with each request.
// Why access token and refresh token are used together
// Think of them as ID card + long‑term pass:
// Access token
// Short‑lived (e.g. 15 min, 1 hour).
// Sent with each API request (in header or cookie).
// If stolen, attacker only has limited time.
// Refresh token
// Longer‑lived (days/weeks).
// Used only to get a new access token when the old one expires.
// Usually stored more carefully (e.g. HTTP‑only cookie, sometimes with extra checks).
// Why send both at login?
// When user logs in successfully, server often:
// Generates both:
// accessToken → for calling APIs right now.
// refreshToken → to silently get a new access token later.
// Sends them back together (in body and/or cookies):
// So the frontend can start calling protected APIs immediately using the access token.
// When the access token expires, the frontend uses the refresh token to ask the server: “give me a new access token” without making the user log in again.
// This combo gives:
// Better security: access token is short‑lived, so stolen tokens are less useful.
// Better UX: refresh token lets users stay logged in for a long time without typing password again.