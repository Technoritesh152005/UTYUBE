import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const likeSchema = new mongoose.Schema({

    likedVideo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    },
    likedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{
    timestamps:true
})

likeSchema.plugin(mongooseAggregatePaginate)

export const likeModel = mongoose.model("Like",likeSchema)
