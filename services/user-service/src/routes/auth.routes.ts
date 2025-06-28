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
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
} from "../controller/auth.controller";
import { AuthenticatedRequest, RequireAuth } from "../middleware/auth";
export const userRouter = express.Router();

userRouter.post("/favorites", RequireAuth, addToFavorites);
userRouter.delete("/favorites", RequireAuth, removeFromFavorites);
userRouter.get("/favorites", RequireAuth, getUserFavorites);

userRouter.post("/register", register);
userRouter.post("/login", login);

userRouter.post("/verify-email", verify);

userRouter.post("/password-reset", recoverPassword);

userRouter.post("/set-password", setPassword);

userRouter.get("/validate-token", validateToken);
userRouter.post("/refresh-token", refreshAccessToken);
userRouter.post("/logout", logout);

userRouter.get("/check-auth", RequireAuth, (req, res: Response) => {
  res
    .status(200)
    .json({ message: "success", user: (req as AuthenticatedRequest).user });
  return;
});
