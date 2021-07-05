const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema;

const hotelSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: "title is required",
    },
    content: {
      type: String,
      required: "title is required",
      maxlength: 10000,
    },
    location: {
      type: String,
    },
    price: {
      type: Number,
      required: "Price is required",
      trim: true,
    },
    postedBy: {
      type: ObjectId,
      ref: "User",
    },
    image: {
      data: Buffer,
      contentType: String,
    },
    from: {
      type: Date,
    },
    to: {
      type: Date,
    },
    bed: {
      type: Number,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Hotel", hotelSchema);
