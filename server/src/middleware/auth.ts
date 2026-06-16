import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const secret = process.env.JWT_SECRET as string;

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, secret);

    console.log("DECODED TOKEN:", decoded);
    (req as any).user = decoded;
    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

export const verifyAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if ((req as any).user?.role === "admin") return next();
  res
    .status(403)
    .json({ success: false, message: "Access denied. Admins only." });
};

export const verifyDoctor = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if ((req as any).user?.role === "doctor") return next();
  res
    .status(403)
    .json({ success: false, message: "Access denied. Doctors only." });
};
