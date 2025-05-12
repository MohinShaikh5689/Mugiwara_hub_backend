import mongoose from "mongoose";

const continueWatchingSchema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true,
    },
    AnimeId: {
        type: Number,
        required: true,
    },
    episodeId: {
        type: String,
        required: true,
    },
    title:{
        type: String,
        required: true,
    },
    image:{
        type: String,
        required: true,
    },
    createdAt :{
        type: Date,
        default: Date.now,
    }
});

const ContinueWatching = mongoose.model("ContinueWatching", continueWatchingSchema);
export default ContinueWatching;