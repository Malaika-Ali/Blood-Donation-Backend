import mongoose, {Schema} from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema=new Schema({
    fullname:{
        type: String,
        required: [true, "Full name is required!"],
        unique: true,
        trim: true,
        index: true
    },
    email:{
        type: String,
        required: [true, "Email is required!"],
        unique: true,
        trim: true,
    },
    password:{
        type: String,
        required: [true,"Password is Required!"],
        trim: true,
    },
    phonenumber:{
        type: Number,
        required: [true,"Phone Number is required!"],
        trim: true,
    },
    group:{
        type: String,
        required: [true,"Blood group Is Required"],
        trim: true,
        index: true
    },
    age:{
        type: Number,
        trim: true,
    },
    area:{
        type: String,
        required: [true,"Area is required!"],
        trim: true,
    },
    role:{
        type: String,
        required: [true,"Role is Required!"],
        default: "donor"
    },
    refreshToken:{
        type: String
    }
    
}, {timestamps: true})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next()
    this.password=await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken=function(){
    return jwt.sign({
        _id: this._id,
        email: this.email
    },process.env.ACCESS_TOKEN_SECRET, 
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign({
        _id: this._id,
    },process.env.REFRESH_TOKEN_SECRET, 
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)
}


export const User=mongoose.model("User", userSchema)