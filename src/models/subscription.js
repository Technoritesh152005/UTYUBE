import mongoose from "mongoose"; 

const subscriptionSchema  = new mongoose.Schema(
    {
       subscriber:{
        type:"SchemaTypes.ObjectId",
        ref:"userModel"
       } 
       ,
       channel:{
         type:"SchemaTypes.ObjectId",
        ref:"userModel"
       }
},{
    timestamps:true,
})
export const subscriptionModel = mongoose.model("subscriptionModel",subscriptionSchema)