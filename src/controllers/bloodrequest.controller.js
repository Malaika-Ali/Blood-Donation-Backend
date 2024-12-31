import { BloodRequest } from '../models/bloodrequest.model.js'
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { User } from '../models/user.model.js';
import { Notification } from '../models/notification.model.js';
import { io } from '../app.js';

import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Create a new blood request
const createBloodRequest = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    const { CNIC, purpose, address } = req.body;

    if ([purpose, address,].some(field => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }


    let imageLocalPath;

    if (req.file) {
        console.log(req.file)
        imageLocalPath = req.file.path
    }

    const image = await uploadOnCloudinary(imageLocalPath)

    const bloodRequest = await BloodRequest.create({
        userId,
        CNIC,
        purpose,
        address,
        image: image?.url || ""
    });


    if (!bloodRequest) {
        throw new ApiError(500, "Failed to create blood request");
    }

    // Populate the userId field to get the recipient's blood group
    const populatedRequest = await BloodRequest.findById(bloodRequest._id).populate('userId', 'group area');
    // Now you can access the recipient's blood group and area
    const recipientBloodGroup = populatedRequest.userId.group;
    const recipientArea = populatedRequest.userId.area;

    // Find donors in the same area and with the same blood group
    const donors = await User.find({
        role: 'donor',
        area: recipientArea, // Use the recipient's area
        group: recipientBloodGroup // Match the recipient's blood group
    });

    console.log(`Donors ${donors}`)




    const notifications = donors.map(donor => {
        return {
            donorId: donor._id,
            recipientId: userId,
            bloodRequestId: bloodRequest._id,
            message: `A new blood request for ${recipientBloodGroup} blood has been made in your area (${recipientArea}).`,
            status: 'pending'
        };
    });

    // Save notifications to the database
    const savedNotifications = await Notification.insertMany(notifications);
    console.log(`Notifs : ${savedNotifications}`)
    if (!savedNotifications) {
        console.log("Notifications were not saved")
    }





    // Emit notifications to each donor
    donors.forEach(donor => {
        io.to(donor._id.toString()).emit('newBloodRequest', {
            message: `New blood request for ${recipientBloodGroup} blood from ${populatedRequest.userId.name} in ${recipientArea}.`,
            bloodRequestId: bloodRequest._id,
            recipientData: {
                name: populatedRequest.userId.name,
                bloodGroup: recipientBloodGroup,
                address: populatedRequest.address,
                purpose: populatedRequest.purpose,
            }
        });
        console.log(`notification sent successfully`)

    });

    return res.status(201).json(new ApiResponse(201, bloodRequest, "Blood request created successfully"));

});



// Get donors from notifications for the current user
// const getDonorsFromNotifications = asyncHandler(async (req, res) => {
//     const userId = req.user._id; // Get the current user's ID from the request

//     // Find notifications where the recipient's ID matches the current user's ID
//     const notifications = await Notification.find({ donorId: userId }).populate('donorId', 'email city phoneNumber');

//     if (!notifications || notifications.length === 0) {
//         return res.status(404).json(new ApiResponse(404, [], "No notifications found for this user"));
//     }

//     // Extract donor information from notifications
//     const donors = notifications.map(notification => ({
//         donorId: notification.donorId._id,
//         email: notification.donorId.email,
//         city: notification.donorId.city,
//         phoneNumber: notification.donorId.phoneNumber,
//         message: notification.message,
//         status: notification.status,
//     }));

//     console.log("finding donors")

//     return res.status(200).json(new ApiResponse(200, donors, "Donors retrieved successfully"));
// });


// const getDonorsFromNotifications = async (req, res) => {
//     try {
//       const currentUserId = req.user._id; // Assuming the current user's ID is in req.user._id
//   console.log(currentUserId)
//       // Find notifications and populate the `bloodRequestId` to access `userId`
//       const notifications = await Notification.find({})
//         .populate({
//           path: 'bloodRequestId',
//           select: 'userId',
//         });

//     console.log(`notifications ${notifications}`)
  
//       // Filter notifications where the populated `userId` matches `currentUserId`
//       const filteredNotifications = notifications.filter(notification =>
//         notification.bloodRequestId?.userId?.toString() === currentUserId.toString()
//       );
  
//       // Respond with the filtered notifications
//       return res.status(200).json({
//         success: true,
//         data: filteredNotifications,
//       });
//     } catch (error) {
//       console.error('Error fetching notifications:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to fetch notifications',
//         error: error.message,
//       });
//     }
//   };


const getDonorsFromNotifications = async (req, res) => {
    try {
        const currentUserId = req.user._id; // Assuming the current user's ID is in req.user._id
        console.log(currentUserId);

        // Find notifications where the recipientId matches currentUser Id
        const notifications = await Notification.find({ recipientId: currentUserId })
            .populate({
                path: 'donorId', // Populate donorId to get donor's data
                select: 'fullname email group area phonenumber city', // Select the fields you want to return
            });

        console.log(`notifications: ${JSON.stringify(notifications)}`);

        // Extract only the donorId data from the notifications
        const donorData = notifications.map(notification => notification.donorId);

        // Respond with the donor data
        return res.status(200).json({
            success: true,
            data: donorData,
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
            error: error.message,
        });
    }
};


export {
    createBloodRequest,
    getDonorsFromNotifications
};
