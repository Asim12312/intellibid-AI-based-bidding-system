import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { User } from '../user/user.model.js';

export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(409, "User with email already exists");
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role
  });

  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const token = user.generateToken();

  const loggedInUser = await User.findById(user._id).select("-password");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  };

  return res
    .status(200)
    .cookie("token", token, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          token
        },
        "User logged in successfully"
      )
    );
});

export const logout = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  };

  return res
    .status(200)
    .clearCookie("token", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});
