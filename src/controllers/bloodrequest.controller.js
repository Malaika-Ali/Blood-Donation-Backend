import { BloodRequest } from '../models/bloodrequest.model.js'
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Create a new blood request
const createBloodRequest = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    const {  fathersName, CNIC, purpose, address, town, city } = req.body;
    console.log(req.body)

    if ([fathersName, purpose, address, town, city].some(field => !field?.trim())) {
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
        fathersName,
        CNIC,
        purpose,
        address,
        town,
        city,
        image: image?.url || ""
    });



    if (!bloodRequest) {
        throw new ApiError(500, "Failed to create blood request");
    }

    return res.status(201).json(new ApiResponse(201, bloodRequest, "Blood request created successfully"));
});

// Get all blood requests
// const getAllBloodRequests = asyncHandler(async (req, res) => {
//     const bloodRequests = await BloodRequest.find();

//     if (!bloodRequests || bloodRequests.length === 0) {
//         throw new ApiError(404, "No blood requests found");
//     }

//     return res.status(200).json(new ApiResponse(200, bloodRequests, "Blood requests retrieved successfully"));
// });

// Get a single blood request by ID
// const getBloodRequestById = asyncHandler(async (req, res) => {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         throw new ApiError(400, "Invalid request ID");
//     }

//     const bloodRequest = await BloodRequest.findById(id);

//     if (!bloodRequest) {
//         throw new ApiError(404, "Blood request not found");
//     }

//     return res.status(200).json(new ApiResponse(200, bloodRequest, "Blood request retrieved successfully"));
// });

// Update a blood request
// const updateBloodRequest = asyncHandler(async (req, res) => {
//     const { id } = req.params;
//     const { patientName, bloodType, quantity, hospital, contactNumber, urgencyLevel, status } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         throw new ApiError(400, "Invalid request ID");
//     }

//     const updatedRequest = await BloodRequest.findByIdAndUpdate(
//         id,
//         { $set: { patientName, bloodType, quantity, hospital, contactNumber, urgencyLevel, status } },
//         { new: true, runValidators: true }
//     );

//     if (!updatedRequest) {
//         throw new ApiError(404, "Blood request not found or update failed");
//     }

//     return res.status(200).json(new ApiResponse(200, updatedRequest, "Blood request updated successfully"));
// });


export {
    createBloodRequest,
    // getAllBloodRequests,
    // getBloodRequestById,
    // updateBloodRequest,
    // deleteBloodRequest,
};
