import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export async function signup(req, res) {
  const { email, password, fullName } = req.body;

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fileds are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    //email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    //check user already exist
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already exists, Please use a different one" });
    }

    //avatar gen
    const idx = Math.floor(Math.random() * 100) + 1; //1-100
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    //create user
    const newUser = await User.create({
      email,
      password,
      fullName,
      profilePic: randomAvatar,
    });

    //stream user
    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: fullName,
        image: newUser.profilePic || randomAvatar || "",
      });
      console.log(`Stream user created or updated: ${newUser.fullName}`);
    } catch (error) {
      console.error("Error upserting stream user: ", error);
    }

    //token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    //cookie
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, //prevent XSS attacks
      sameSite: "strict", //prevent CSRF attacks
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error("Error in signup controller " + error);
    res.status(500).json({ message: "Internal server error" });
  }
}
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    //validation
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //check password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    //cookie
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, //prevent XSS attacks
      sameSite: "strict", //prevent CSRF attacks
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error in login controller " + error);
    res.status(500).json({ message: "Internal server error" });
  }
}
export function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "LOGOUT SUCCESSFULLY" });
}
export async function onboard(req, res) {
  try {
    const userId = req.user._id;
    const { fullName, bio, nativeLanguage, learningLanguage, location } =
      req.body;
    if (
      !fullName ||
      !bio ||
      !nativeLanguage ||
      !learningLanguage ||
      !location
    ) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
        ].filter(Boolean),
      });
    }
    //update user
    const updatedUser = await User.findByIdAndUpdate(userId,{
      ...req.body,
      isOnboarded: true,
    },{ new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    //stream user
    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
      console.log(`Stream user created or updated: ${updatedUser.fullName}`);
    } catch (error) {
      console.error("Error upserting stream user: ", error);
    }

    //response
    res.status(200).json({success:true, user: updatedUser});
    
  } catch (error) {
    console.error("Error in onboarding controller " + error);
    res.status(500).json({ message: "Internal server error" });
  }
}
