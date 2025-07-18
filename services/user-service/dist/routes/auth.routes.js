"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controller/auth.controller");
const auth_1 = require("../middleware/auth");
exports.userRouter = express_1.default.Router();
exports.userRouter.post("/favorites", auth_1.RequireAuth, auth_controller_1.addToFavorites);
exports.userRouter.delete("/favorites", auth_1.RequireAuth, auth_controller_1.removeFromFavorites);
exports.userRouter.get("/favorites", auth_1.RequireAuth, auth_controller_1.getUserFavorites);
exports.userRouter.post("/register", auth_controller_1.register);
exports.userRouter.post("/login", auth_controller_1.login);
exports.userRouter.post("/verify-email", auth_controller_1.verify);
exports.userRouter.post("/forgot-password", auth_controller_1.recoverPassword);
exports.userRouter.post("/set-password", auth_controller_1.setPassword);
exports.userRouter.get("/validate-token", auth_controller_1.validateToken);
exports.userRouter.post("/refresh-token", auth_controller_1.refreshAccessToken);
exports.userRouter.post("/logout", auth_controller_1.logout);
exports.userRouter.get("/check-auth", auth_1.RequireAuth, (req, res) => {
    res
        .status(200)
        .json({ message: "success", user: req.user });
    return;
});
