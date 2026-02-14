import mongoose from "mongoose"

const commentSchema = new mongoose.Schema(
    {
        commentContent:{
            type:String,
        },
        commentedUser:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
        ,
        commentedVideo :{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    },{
    timestamps:true
    }
)
export const commentModel = mongoose.model("Comment",commentSchema)