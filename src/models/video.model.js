import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = mongoose.Schema(
    {
        videoFile: {
            type: String, //cloudnary url
            required: true
        },
        thumbnail: {
            type: String, //cloudnary url
            required: true
        },
        title: {
            type: String, //cloudnary url
            required: true
        },
          description:{
            type:String, //cloudnary url
            required:true
        },
          duration:{
            type:String, //cloudnary url
            required:true
        },
        views:{
            type:Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            default:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }

    },
    {
        timestamp: true
    }

);
videoSchema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model("Video", videoSchema);   
