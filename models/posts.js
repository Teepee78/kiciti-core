import mongoose from 'mongoose';
import dotenv from "dotenv";

dotenv.config();

const postSchema =  new mongoose.Schema({
	content: {
    type: String,
    maxLength: 2000,
    required: true
  },

  created_at: {
    type: Date,
    required: true,
    default: Date.now
  },

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  likes: [{
	type: mongoose.Schema.Types.ObjectId,
	ref: "Like"
  }],

  comments: [{
	type: mongoose.Schema.Types.ObjectId,
	ref: "Comment"
  }]
});


export default mongoose.model("Post", postSchema);
