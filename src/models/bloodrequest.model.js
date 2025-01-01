import mongoose from "mongoose";

const BloodRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
//   bloodType: {
//     type: String,
//     required: true,
//   },
//   unitsRequired: {
//     type: Number,
//     required: true,
//   },
address: {
  type: String,
  required: true,
},
  CNIC: {
    type: String,
    required: true,
    // match: /^[0-9]{13}$/,
    match: /^[0-9]{5}-[0-9]{7}-[0-9]$/, // CNIC format with dashes 
  },
  purpose: {
    type: String,
    required: true,
  },
 
  image: {
    type: String, // Store the image URL or path
    // required: true,
  },
//   status: {
//     type: String,
//     enum: ['Pending', 'Fulfilled', 'Rejected'],
//     default: 'Pending',
//   },
});

export const BloodRequest = mongoose.model('BloodRequest', BloodRequestSchema);
