import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Admin } from "../models/admin.model.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (adminId) => {
    try {
        const admin = await Admin.findById(adminId);
        const accessToken = admin.generateAccessToken();
        const refreshToken = admin.generateRefreshToken();
        admin.refreshToken = refreshToken;
        await admin.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong");
    }
};
const registerAdmin = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;


    if (
        [username, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
    if (existedAdmin) {
        throw new ApiError(400, "Admin with this username or email already exists");
    }

    const admin = await Admin.create({
        email,
        password,
        username: username.toLowerCase(),
    });
    const createdAdmin = await Admin.findById(admin._id).select(
        "-password -refreshToken"
    );

    if (!createdAdmin) {
        throw new ApiError(500, "Something went wrong while registering the Admin");
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createdAdmin, "Admin registered successfully"));
});

const loginAdmin = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "No username or email");
    }

    //check user in db
    const admin = await Admin.findOne({ $or: [{ username }, { email }] });
    if (!admin) {
        throw new ApiError(400, "Admin with this username or email not exists");
    }
    //check password correct
    const isPasswordValid = await admin.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(400, "Incorrect password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        admin._id
    );

    const loggedInAdmin = await Admin.findById(admin._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { admin: loggedInAdmin, accessToken, refreshToken },
                "Admin logged in successfully"
            )
        );
});

const logoutAdmin = asyncHandler(async (req, res) => {
    await Admin.findByIdAndUpdate(
        req.admin._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Admin logged out successfully"));
});


export { loginAdmin, registerAdmin, logoutAdmin };