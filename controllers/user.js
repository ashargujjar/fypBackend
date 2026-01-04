import bcrypt from "bcryptjs";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { SendMail } from "../src/mails.js";
import { generateOTP } from "../emails/otp.js";
import { welcomeEmailTemplate } from "../emails/welcomeEmail.js";
import { otpEmailTemplate } from "../emails/otp.js";
import { passwordChangedEmailTemplate } from "../emails/passwordChange.js";
// --------------- login ---------------

export const login = async (req, res) => {
  const { email, password, role } = req.body;
  console.log(req.body);
  try {
    const user = await User.getUser(email, role);
    console.log(user);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res
      .status(200)
      .json({ success: true, message: "Login successful", token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ succes: false, message: "Server error" });
  }
};
// -------------sign up -----------------

export const signup = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const us = await User.getUser(email, role);
    if (!us) {
      const hashPassword = await bcrypt.hash(password, 5);
      const user = new User(name, email, phone, hashPassword, role);
      const result = await user.save();
      if (result) {
        await SendMail({
          to: email,
          subject: "Welcome to ShipSmart 🚚",
          text: `Welcome ${name}, your ShipSmart account is ready.`,
          html: welcomeEmailTemplate({
            userName: name,
            email: email,
            loginUrl: `${process.env.FROTEND_URL}/role`,
          }),
        });
        return res.status(201).json({ success: true, result: result });
      } else {
        throw new Error("error adding the user");
      }
    } else {
      return res.status(401).json({
        success: false,
        message: "user with this mail already exists",
      });
    }
  } catch (error) {
    return res.status(401).json({ success: false, error: error });
  }
};

// ------------send otp -----------

export const SendOtp = async (req, res) => {
  try {
    const { email, role } = req.body;

    const user = await User.getUser(email, role);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = generateOTP();

    user.forgotPasswordOtp = await bcrypt.hash(otp.toString(), 10);
    user.forgotPasswordOtpExpiry = Date.now() + 5 * 60 * 1000; // 5 mins

    await user.save();

    await SendMail({
      to: user.email,
      subject: "Your ShipSmart OTP Code",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
      html: otpEmailTemplate({
        userName: user.name,
        otp,
        validityMinutes: 5,
      }),
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("SendOtp error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ---------- verify otp -------

export const verifyOtp = async (req, res) => {
  try {
    const { email, role, otp } = req.body;

    const user = await User.getUser(email, role);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.forgotPasswordOtp || !user.forgotPasswordOtpExpiry) {
      return res.status(400).json({
        success: false,
        message: "No OTP request found",
      });
    }
    if (Date.now() > user.forgotPasswordOtpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }
    const isOtpValid = await bcrypt.compare(
      otp.toString(),
      user.forgotPasswordOtp
    );
    if (!isOtpValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }
    user.forgotPasswordOtp = undefined;
    user.forgotPasswordOtpExpiry = undefined;

    await user.save();
    const resetToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        purpose: "password_reset",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken: resetToken,
    });
  } catch (error) {
    console.error("VerifyOtp error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// --------------- reset password -------------

export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const payload = req.otpPayload;

    if (!payload || payload.purpose !== "password_reset") {
      return res.status(401).json({
        success: false,
        message: "Invalid or missing reset token.",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Please provide a password with at least 6 characters.",
      });
    }

    const user = await User.getUserById(payload.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    user.password = await bcrypt.hash(password, 5);
    user.forgotPasswordOtp = undefined;
    user.forgotPasswordOtpExpiry = undefined;

    await user.save();

    await SendMail({
      to: user.email,
      subject: "Your ShipSmart password was changed",
      text: `Hi ${user.name}, your password was updated successfully.`,
      html: passwordChangedEmailTemplate({ userName: user.name }),
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("ResetPassword error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while resetting password.",
    });
  }
};

// ----------- getWalletBalance -------------
export const getWalletBalance = async (req, res) => {
  try {
    const wallet = await User.getWalletBalance(req.user.id);

    if (!wallet) {
      throw new Error("error ");
    }
    return res.status(201).json({ success: true, wallet: wallet });
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "error fetching the wallet" });
  }
};

// ----------- getUserProfile -------------
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.getUserById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return res.status(200).json({ success: true, user: safeUser });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ----------- updateUserProfile -------------
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.getUserById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (email && email !== user.email) {
      const existingUser = await User.getUserByEmail(email);
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res
          .status(409)
          .json({ success: false, message: "Email already in use" });
      }
      user.email = email;
    }

    if (name) {
      user.name = name;
    }
    if (phone) {
      user.phone = phone;
    }

    await user.save();

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({ success: true, user: safeUser });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
