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
  fathersName: {
    type: String,
    required: true,
  },
  CNIC: {
    type: String,
    required: true,
    match: /^[0-9]{13}$/, // CNIC format validation
  },
  purpose: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  town: {
    type: String,
    required: true,
  },
  city: {
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
