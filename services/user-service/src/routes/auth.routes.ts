import express from "express";
import { Request, Response } from "express";
import {
  login,
  recoverPassword,
  register,
  setPassword,
  verify,
  validateToken,
  refreshAccessToken,
  logout,
} from "../controller/auth.controller";
import { AuthenticatedRequest, RequireAuth } from "../middleware/auth";
export const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);

authRouter.post("/verify-email", verify);

authRouter.post("/password-reset", recoverPassword);

authRouter.post("/set-password", setPassword);

authRouter.get("/validate-token", validateToken);
authRouter.post("/refresh-token", refreshAccessToken);
authRouter.post("/logout", logout);

authRouter.get("/check-auth", RequireAuth, (req, res: Response) => {
  res
    .status(200)
    .json({ message: "success", user: (req as AuthenticatedRequest).user });
  return;
});
