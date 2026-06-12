import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { UserModel } from "../models/user.model";

// Called during doctor registration — generates secret + QR
export const generateTwoFactorSecret = async (
  userId: string,
  email: string
) => {
  const secret = speakeasy.generateSecret({
    name: `HealthPlatform (${email})`,
    length: 20,
  });

  await UserModel.findByIdAndUpdate(userId, {
    twoFactorSecret: secret.base32,
    twoFactorEnabled: false,
    twoFactorVerified: false,
  });

  const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

  return {
    secret: secret.base32, // backup key shown to doctor
    qrCode,                // base64 PNG → render as <img src={qrCode} />
  };
};

// Doctor scans QR then submits first OTP to confirm setup
export const verifyAndEnableTwoFactor = async (
  userId: string,
  token: string
): Promise<boolean> => {
  console.log(
  "USER ID:",
  userId
);

const user =
  await UserModel.findById(
    userId
  );

console.log(
  "USER:",
  user
);
  if (!user?.twoFactorSecret) throw new Error("2FA not initialized");

  const isValid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token,
    window: 1, // allows ±30 sec clock drift
  });

  if (!isValid) return false;

  await UserModel.findByIdAndUpdate(userId, {
    twoFactorEnabled: true,
    twoFactorVerified: true,
  });

  return true;
};

// Called on every doctor login to validate OTP
export const verifyTwoFactorToken = async (
  userId: string,
  token: string
): Promise<boolean> => {
  const user = await UserModel.findById(userId);
  if (!user?.twoFactorSecret) throw new Error("2FA not set up");

  return speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token,
    window: 1,
  });
};