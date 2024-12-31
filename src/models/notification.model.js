import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  bloodRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodRequest',
  },
  message: String,
  status: {
    type: String,
    default: 'pending'
  },
},
{timestamps: true});

export const Notification = mongoose.model('Notification', NotificationSchema);
