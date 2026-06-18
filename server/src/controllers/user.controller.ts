import { Request, Response } from "express";
import {
  register,
  login,
  getUser,
  getUserProfile,
} from "../services/user.service";
import {
  generateTwoFactorSecret,
  verifyAndEnableTwoFactor,
  verifyTwoFactorToken,
} from "../services/twoFactor.service";
import { logAccess } from "../services/auditLog.service";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const secret = process.env.JWT_SECRET as string;

// ─── REGISTER ────────────────────────────────────────────────
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await register(name, email, password, role);

    // Generate JWT immediately
    const authToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      secret,
      {
        expiresIn: "1h",
      },
    );

    // DOCTOR FLOW
    if (role === "doctor") {
      const twoFactorData = await generateTwoFactorSecret(
        user._id.toString(),
        email,
      );

      return res.status(201).json({
        success: true,

        message: "Doctor registered successfully. Scan QR and verify OTP.",

        token: authToken,

        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },

        twoFactor: {
          qrCode: twoFactorData.qrCode,
          secret: twoFactorData.secret,
        },
      });
    }

    // PATIENT / ADMIN
    return res.status(201).json({
      success: true,

      message: "User registered successfully",

      token: authToken,

      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── LOGIN ───────────────────────────────────────────────────
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password, totpToken } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await login(email);

    // Step 1: Password check (all roles)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({
          success: false,
          field: "password",
          message: "Password does not match",
        });
    }

    // Step 2: 2FA check (doctors only)
    if (user.role === "doctor" && user.twoFactorEnabled) {
      if (!totpToken) {
        // Tell frontend: show OTP input field
        return res.status(200).json({
          success: false,
          requiresTwoFactor: true,
          message:
            "Password verified. Please provide your 6-digit authenticator code.",
        });
      }

      const isOtpValid = await verifyTwoFactorToken(
        user._id.toString(),
        totpToken,
      );
      if (!isOtpValid) {
        return res.status(401).json({
          success: false,
          field: "totpToken",
          message: "Invalid or expired 2FA code. Try again.",
        });
      }
    }

    // Step 3: Issue JWT (all roles)
    const token = jwt.sign({ id: user._id, role: user.role }, secret, {
      expiresIn: "1h",
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .json({
        success: true,
        token,
        role: user.role,
        id: user._id,
        name: user.name,
      });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, field: "email", message: error.message });
  }
};

// ─── VERIFY 2FA (doctor scans QR → submits first OTP) ────────
export const verifyTwoFactor = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { token } = req.body;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "OTP token is required" });
    }

    const isValid = await verifyAndEnableTwoFactor(userId, token);
    if (!isValid) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid OTP. Make sure your authenticator app is synced.",
        });
    }

    res.json({
      success: true,
      message: "2FA enabled successfully. You can now login with your OTP.",
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── PROFILE ─────────────────────────────────────────────────
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const role=(req as any).user.role;
    const user = await getUserProfile(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if(role==="admin"){
      await logAccess({
        action:"VIEW_PATIENT_PROFILE",
        performedBy:userId,
        performedByRole:role,
        targetPatientId:userId,
        targetResourceId:userId,
        resourceType:"patient_profile",
        req,
      })
    }

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ALL USERS (admin only) ───────────────────────────────────
export const getUsers = async (req: Request, res: Response) => {
  try {
    const adminId=(req as any).user.id;
    const users = await getUser();

    await logAccess({
      action:"VIEW_ALL_PATIENTS",
      performedBy:adminId,
      performedByRole:"admin",
      resourceType:"patient_profile",
      req,
      metadata:{count:users.length},
    })
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
