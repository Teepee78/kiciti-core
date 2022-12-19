import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// utility functions
import validateAge from '../utilities/age.js';

const userSchema =  new mongoose.Schema({
	username: {
    type: String,
    minLength: 2,
    maxLength: 50,
    unique: true
  },

  first_name: {
    type: String,
    minLength: 2,
    maxLength: 50,
    required: true
  },

  middle_name: {
    type: String,
    minLength: 2,
    maxLength: 50,
  },

  last_name: {
    type: String,
    minLength: 2,
    maxLength: 50,
    required: true
  },

  email: {
    type: String,
    maxLength: 100,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  created_at: {
    type: Date,
    required: true,
    default: Date.now
  },

  dob: {
    type: Date,
    required: true,
    validate: validateAge
  },

  phone_number: {
    type: String,
    index: {
      unique: true,
      partialFilterExpression: { phone_number: { $type: 'string' } }
    }
  },

  country: {
    type: String,
    required: true
  },

  gender: {
    type: String,
    enum: ["male", "female"],
    required: true
  },

  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post"
  }],

  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Like"
  }]
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({
    exp: Math.floor(Date.now() / 1000) + (2 * 24 * 60 * 60),
    _id: this._id
  }, process.env.KICITI_JWT);
}


export default mongoose.model("User", userSchema);
