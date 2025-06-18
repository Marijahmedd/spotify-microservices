import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const publicKey = process.env.PUBLIC_KEY!;

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    isVerified: boolean;
  };
}

export async function RequireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    }) as any;

    console.log("✅ Token verified:", decoded);
    console.log(
      "🕒 Token expires at:",
      new Date(decoded.exp * 1000).toISOString()
    );

    (req as AuthenticatedRequest).user = {
      id: decoded.sub,
      email: decoded.email,
      isVerified: decoded.isVerified,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log("⏳ Token expired, requesting refresh...");
      res.status(401).json({ error: "Token expired" }); // ✅ Triggers frontend refresh
      return;
    }

    console.log("❌ JWT verification failed", error);
    res.status(403).json({ error: "Unauthorized: Invalid token" });
    return;
  }
}
