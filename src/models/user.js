import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      // helps for better search performance which is index= true
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    fullname: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    avatar: {
      // url of the image
      type: String,
      default: null,
      required: true,
    },
    coverimage: {
      type: String,
      default: null,
      required: false,
    },

    watchhistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VideoModel",
      },
    ],

    password: {
      type: String,
      required: true,
      select: true, // when we fetch user data password will not be fetched
    },
    refreshtoken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

// pre is a middleware in mongoose
// pre is a plugin which runs before saving data to database
// it has various hooks like save, update, delete
// so u can give callback function also but it does nt have access to your schema fiels
// also it takes time so we use next to move to next middleware or save data to database
userSchema.pre("save", async function (next) {
  // 10 is round of hashing\
  // this.ismodified is already built in method which checks if password is modified or not
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
  
});

// means reducable code?if we wnat to check password we just calll user.ispasswordmatch and pass plain password taken?
userSchema.methods.isPasswordMatch = async function (enteredPassword) {
  // return true if password is correct otherwise false
  // checks the entered password with the password in the database
  return await bcrypt.compare(enteredPassword, this.password);
};

// access token is used to access the api
// allows some operations to be performed on the api
userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    // u need to pass payload cause for every api hit it can have access to this payload data without hitting seperately on db
    {
      // It answers:
      // 👉 WHO is making this request?
      _id: this._id,
      username: this.username,
      email: this.email,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

// refresh token is used to refresh the access token
// it is used to get new access token without hitting the database
// it is stored in the database and is used to refresh the access token
// it is stored in the browser's cookies
// it is used to refresh the access token when it is expired
// it is used to refresh the access token when the user is logged in
// it is used to refresh the access token when the user is logged out
// it is used to refresh the access token when the user is logged in
userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

export const userModel = mongoose.model("User", userSchema);

// bcrypt helps to hash password
// jwt helps to create token for authentication
