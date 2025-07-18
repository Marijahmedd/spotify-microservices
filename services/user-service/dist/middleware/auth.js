"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireAuth = RequireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const publicKey = process.env.PUBLIC_KEY;
function RequireAuth(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "Unauthorized: No token provided" });
            return;
        }
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, publicKey, {
                algorithms: ["RS256"],
            });
            console.log("✅ Token verified:", decoded);
            console.log("🕒 Token expires at:", new Date(decoded.exp * 1000).toISOString());
            req.user = {
                id: decoded.sub,
                email: decoded.email,
                isVerified: decoded.isVerified,
                role: decoded.role,
            };
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                console.log("⏳ Token expired, requesting refresh...");
                res.status(401).json({ error: "Token expired" });
                return;
            }
            console.log("❌ JWT verification failed", error);
            res.status(403).json({ error: "Unauthorized: Invalid token" });
            return;
        }
    });
}
