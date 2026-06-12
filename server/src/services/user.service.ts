import { UserModel } from "../models/user.model";
import bcrypt from "bcryptjs";
import { validatePassword } from "../utils/passwordPolicy";

export const register = async (
  name: string,
  email: string,
  password: string,
  role: string
) => {
  const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
  if (existingUser) throw new Error("Email already exists");

  const { valid, errors } = validatePassword(password, role);
  if (!valid) throw new Error(errors.join(". "));

  // doctors get higher bcrypt rounds
  const saltRounds = role === "doctor" ? 12 : 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  return await UserModel.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role,
  });
};

export const login = async (email: string) => {
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error("User not found");
  return user;
};

export const getUser = async () => {
  return await UserModel.find().select("-password -twoFactorSecret");
};

export const getUserProfile = async (userId: string) => {
  return await UserModel.findById(userId).select("-password -twoFactorSecret");
};