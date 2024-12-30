import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


// Method to generate access and refresh tokens
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // Passsing the above generated refreshToken to the user object
        // refresh token comes from the user model property
        user.refreshToken = refreshToken

        // Now we will save this access token
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access and Refresh Tokens")
    }
}


// It registers users
const registerUser = asyncHandler(
    async (req, res) => {
        console.log(req.body)
        const { fullname, email, password, phonenumber, group, age, area, role } = req.body
        console.log(`name ${fullname},email ${email}, password ${password}, phonenumber ${phonenumber}, group ${group}, age ${age}, area ${area}, role ${role}`)

        //    if (fullname==="") {
        //     throw new ApiError(400, "Full Name is Required!")
        //    }

        if (
            [fullname, email, password, group, area, role].some((field) => field?.trim() === '')
            // [phonenumber, age].some((field) => field == null) 
        ) {
            throw new ApiError(400, "All fields are required")
        }

        // if (!/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        //     throw new ApiError(400, `Invalid email address format`);
        // }


        const existingUser = await User.findOne({
            email
        })


        if (existingUser) {
            throw new ApiError(409, "This user already exists")
        }



        const user = await User.create({
            fullname,
            age,
            email,
            password,
            phonenumber,
            group,
            area,
            role
        })


        // checking if user already exists
        const userExisted = await User.findById(user._id).select("-password -refreshToken")

        if (!userExisted) {
            throw new ApiError(500, 'Something went wrong while registering the user')
        }

        return res.status(201).json(
            new ApiResponse(
                200,
                userExisted,
                "User Registered Successfully!"
            )
        )


    })


const loginUser = asyncHandler(async (req, res) => {
    // request body se data ley ao
    // check is username/email/required fields exist
    // find the user
    // if user existes, check password
    // access and refresh token
    // send these tokens in cookies
    // send success response

    const { email, password } = req.body
    console.log(`${email} ${password}`)

    if (!email) {
        throw new ApiError(400, "email is required")
    }

    // using the mongoDb or operator
    // This User comes from the schema we imported from the user model
    // Since the database is in another continent so need await here
    const user = await User.findOne({
       email
    })

    // If user is not found
    if (!user) {
        throw new ApiError(404, "The user does not exist")
    }


    // ye argument wala password req.body se aya
    const isPasswordValid = await user.isPasswordCorrect(password)

    // if the password is not correct we get false and throw error
    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect Password! Invalid user credentials")
    }

    // Destructuring the accessToken and  refresh token from the token generation function
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    // select tells which fields not to give
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


    // set options for setting cookies
    // These options make the cookies modifiable only through server and only accessible to frontend and not modifiable through the frontend otherwise cookies are modifiable through frontend also
    const options = {
        httpOnly: true,
        secure: true,

    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser, accessToken, refreshToken
            },
                "User Logged In successfully")
        )
})


// User Logout
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: { refreshToken: undefined },

    },
        { new: true })


    const options = {
        httpOnly: true,
        secure: true,

    }

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User logged Out"))
})


// controller to refresh access token
const refreshAcccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        //  if fictitious token is given
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }


        // Comparing incomingRefreshToken and the refreshToken saved in the user entry in the database
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken, newRefreshToken

                    },
                    "Access Token refreshed successfully"
                )
            )

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refreshToken")
    }

})


// const changeCurrentPassword = asyncHandler(async (req, res) => {
//     const { oldPassword, newPassword } = req.body

//     const user = await User.findById(req.user?._id)
//     const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

//     if (!isPasswordCorrect) {
//         throw new ApiError(400, "Invalid Password")
//     }

//     user.password = newPassword
//     await user.save({ validateBeforeSave: false })

//     return res.status(200).json(new ApiResponse(200, {}, "Password changed Successfully"))
// })


// Get Current User
const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current User fetched Successfully"))
})



// Updating Text based details of user
// const updateAccountDetails = asyncHandler(async (req, res) => {
//     const { fullname, email } = req.body

//     if (!fullname || !email) {
//         throw new ApiError(400, "All fields are required")
//     }

//     const user = await User.findByIdAndUpdate(req.user?._id,
//         {
//             $set: {
//                 fullname,
//                 email,

//             }
//         },
//         // Due to this new: true property the information returned in the user variable here will be updated one
//         { new: true }
//     )
//         .select("-password")

//     return res.status(200)
//         .json(new ApiResponse(200, user, "Account Details Updated Successfully!"))

// })



// export { registerUser, loginUser, logoutUser, refreshAcccessToken, changeCurrentPassword, getCurrentUser,updateAccountDetails, updateUserAvatar, updateUsercoverImage, getUserChannelProfile, getWatchHistory }
export { registerUser, loginUser, logoutUser, refreshAcccessToken, getCurrentUser }