import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema(
  {
    videoFile: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    ispublic: {
      type: Boolean,
      default: true,
    },
    videoowner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
    },
  },
  {
    timestamps: true,
  },
);

VideoSchema.plugin(mongooseAggregatePaginate);

export const VideoModel = mongoose.model("Video", videoSchema);
