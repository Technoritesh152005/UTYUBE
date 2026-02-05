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
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// means reducable code?if we wnat to check password we just calll user.ispasswordmatch and pass plain password taken?
userSchema.methods.isPasswordMatch = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  jwt.sign(
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

userSchema.methods.generateRefreshToken = async function () {
  jwt.sign(
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
