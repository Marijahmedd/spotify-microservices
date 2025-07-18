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
exports.register = exports.getUserFavorites = exports.removeFromFavorites = exports.addToFavorites = void 0;
exports.verify = verify;
exports.login = login;
exports.recoverPassword = recoverPassword;
exports.setPassword = setPassword;
exports.validateToken = validateToken;
exports.refreshAccessToken = refreshAccessToken;
exports.logout = logout;
const dbConnect_1 = require("../lib/dbConnect");
const hash_1 = require("../lib/hash");
const token_1 = require("../lib/token");
const validation_1 = require("../lib/validation");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sqs_1 = require("../lib/sqs");
const addToFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const { songId } = req.body;
    if (!songId) {
        res.status(400).json({ error: "Missing songId" });
        return;
    }
    try {
        // Check if already favorited  const { songId } = req.body;
        const existing = yield dbConnect_1.prisma.favorite.findUnique({
            where: {
                user_song_unique: { userId, songId },
            },
        });
        if (existing) {
            res.status(409).json({ message: "Song already in favorites" });
            return;
        }
        // Add to favorites
        const favorite = yield dbConnect_1.prisma.favorite.create({
            data: {
                userId,
                songId,
            },
        });
        res.status(201).json({ message: "Added to favorites", favorite });
        return;
    }
    catch (error) {
        console.error("Error adding to favorites:", error);
        res.status(500).json({ error: "Internal server error" });
        return;
    }
});
exports.addToFavorites = addToFavorites;
const removeFromFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const { songId } = req.body;
    if (!songId) {
        res.status(400).json({ error: "Missing songId" });
        return;
    }
    try {
        // Check if already favorited  const { songId } = req.body;
        const existing = yield dbConnect_1.prisma.favorite.findUnique({
            where: {
                user_song_unique: { userId, songId },
            },
        });
        if (!existing) {
            res.status(409).json({ message: "This song is not favorite" });
            return;
        }
        // Add to favorites
        yield dbConnect_1.prisma.favorite.delete({
            where: {
                user_song_unique: { userId, songId },
            },
        });
        res.status(201).json({ message: "removed from favorites" });
        return;
    }
    catch (error) {
        console.error("Error removing from favorites:", error);
        res.status(500).json({ error: "Internal server error" });
        return;
    }
});
exports.removeFromFavorites = removeFromFavorites;
const getUserFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    try {
        const favorites = yield dbConnect_1.prisma.favorite.findMany({
            where: {
                userId,
            },
        });
        res.status(201).json({ favorites });
        return;
    }
    catch (error) {
        console.error("Error fetching favorites:", error);
        res.status(500).json({ error: "Internal server error" });
        return;
    }
});
exports.getUserFavorites = getUserFavorites;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsed = validation_1.registrationSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: "Invalid input" });
            return;
        }
        const { email, password } = parsed.data;
        const existingUser = yield dbConnect_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: "Email already registered" });
            return;
        }
        const HashedPassword = yield (0, hash_1.hashPassword)(password);
        let newUser = null;
        try {
            newUser = yield dbConnect_1.prisma.user.create({
                data: {
                    email,
                    password: HashedPassword,
                },
            });
            console.log("✅ User created successfully:", newUser.email);
        }
        catch (createError) {
            console.error("❌ Error creating user:", createError);
            // Check for specific MongoDB/Prisma errors
            if ((createError === null || createError === void 0 ? void 0 : createError.code) === "P2002") {
                res.status(400).json({ error: "Email already exists" });
                return;
            }
            if ((createError === null || createError === void 0 ? void 0 : createError.code) === "P1001") {
                res.status(500).json({ error: "Database connection failed" });
                return;
            }
            // Log the full error for debugging
            console.error("Full error details:", JSON.stringify(createError, null, 2));
            res.status(400).json({
                error: "Error Creating user",
                details: (createError === null || createError === void 0 ? void 0 : createError.message) || "Unknown error",
                code: (createError === null || createError === void 0 ? void 0 : createError.code) || "No code",
            });
            return;
        }
        const token = (0, token_1.generateToken)();
        const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
        let storeToken = null;
        try {
            storeToken = yield dbConnect_1.prisma.emailVerificationToken.create({
                data: {
                    token,
                    expiresAt: expires,
                    userId: newUser.id,
                },
            });
        }
        catch (storeTokenError) {
            res.status(400).json({ error: "error storing token to db" });
            return;
        }
        try {
            yield (0, sqs_1.enqueueEmailJob)("verify", email, token);
        }
        catch (verificationMailError) {
            console.log("verification mail error", verificationMailError);
            res.status(500).json({ error: "verification mail error" });
            return;
        }
        res.status(201).json({
            message: "user created successfully",
        });
        return;
    }
    catch (error) {
        res.status(500).json({ error: "something went wrong" });
        return;
    }
});
exports.register = register;
function verify(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { token } = req.body;
            if (!token) {
                res.status(404).json({ error: "Token Missing! " });
                return;
            }
            const VerificationRecord = yield dbConnect_1.prisma.emailVerificationToken.findUnique({
                where: {
                    token,
                },
                include: {
                    user: true,
                },
            });
            if (!VerificationRecord ||
                VerificationRecord.expiresAt.getTime() < Date.now()) {
                res.status(400).json({ error: "Token invalid or expired" });
                return;
            }
            const userVerified = yield dbConnect_1.prisma.user.update({
                where: {
                    id: VerificationRecord.user.id,
                },
                data: {
                    verified: true,
                },
            });
            yield dbConnect_1.prisma.emailVerificationToken.delete({
                where: { token },
            });
            res.status(200).json({ message: "User Verified ", userVerified });
            return;
        }
        catch (error) {
            res.status(500).json({ message: "Something Went Wrong ", error });
            return;
        }
    });
}
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const privateKey = process.env.PRIVATE_KEY;
        const refreshPrivateKey = process.env.REFRESH_PRIVATE_KEY;
        try {
            const { email, password } = req.body;
            let user = null;
            try {
                user = yield dbConnect_1.prisma.user.findUnique({
                    where: {
                        email,
                    },
                });
            }
            catch (userError) {
                res.status(500).json({ error: "error fetching user data" });
                return;
            }
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }
            const correctPassword = yield (0, hash_1.comparePassword)(password, user.password);
            if (!correctPassword) {
                res.status(401).json({ error: "Incorrect email or password" });
                return;
            }
            const refreshToken = jsonwebtoken_1.default.sign({
                sub: user.id,
                version: user.tokenVersion,
            }, refreshPrivateKey, {
                algorithm: "RS256",
                expiresIn: "7d",
            });
            const token = jsonwebtoken_1.default.sign({
                sub: user.id,
                isVerified: user.verified,
                email: user.email,
                role: user.role,
            }, privateKey, {
                algorithm: "RS256",
                expiresIn: "15m",
            });
            const userData = {
                sub: user.id,
                isVerified: user.verified,
                email: user.email,
                role: user.role,
            };
            res.cookie("refreshToken", refreshToken, {
                path: "/",
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res
                .status(200)
                .json({ message: "Successfully login", userData, accessToken: token });
            return;
        }
        catch (error) {
            res.status(500).json({ error: "Internal error" });
            return;
        }
    });
}
function recoverPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const parsed = validation_1.passwordRecoverySchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: "invalid email" });
            return;
        }
        const { email } = parsed.data;
        let user = null;
        try {
            user = yield dbConnect_1.prisma.user.findUnique({
                where: { email },
                include: { verificationToken: true },
            });
            if (!user) {
                res.status(404).json({ error: "user not found" });
                return;
            }
        }
        catch (error) {
            res.status(500).json({ error: "Internal error" });
            return;
        }
        try {
            const token = (0, token_1.generateToken)();
            if (!user.verificationToken) {
                yield dbConnect_1.prisma.emailVerificationToken.create({
                    data: {
                        userId: user.id,
                        token,
                        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
                    },
                });
                yield (0, sqs_1.enqueueEmailJob)("reset", email, token);
                res.status(200).json({ message: "Reset password link sent to the mail" });
                return;
            }
            if (user.verificationToken) {
                const updateToken = yield dbConnect_1.prisma.emailVerificationToken.update({
                    where: { userId: user.id },
                    data: {
                        userId: user.id,
                        token,
                        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
                    },
                });
                // await sendPasswordEmail(user.email, token);
                yield (0, sqs_1.enqueueEmailJob)("reset", email, token);
                res.status(200).json({ message: "Reset password link sent to the mail" });
                return;
            }
        }
        catch (error) {
            res.status(500).json({ error: "error creating new token" });
            return;
        }
    });
}
function setPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { token, password, passwordAgain } = req.body;
        try {
            const userData = yield dbConnect_1.prisma.emailVerificationToken.findUnique({
                where: {
                    token,
                },
                include: {
                    user: true,
                },
            });
            if (!userData || userData.expiresAt.getTime() < Date.now()) {
                res.status(404).json({ error: "Invalid or expired token" });
                return;
            }
            if (password !== passwordAgain) {
                res.status(500).json({ message: "Passwords Do not Match" });
                return;
            }
            const hashedPassword = yield (0, hash_1.hashPassword)(password);
            const updatePassword = yield dbConnect_1.prisma.user.update({
                where: {
                    id: userData.userId,
                },
                data: {
                    password: hashedPassword,
                    verified: true,
                    tokenVersion: { increment: 1 },
                },
            });
            yield dbConnect_1.prisma.emailVerificationToken.delete({
                where: {
                    token,
                },
            });
            res
                .status(200)
                .json({ message: "Password reset successful", updatePassword });
            return;
        }
        catch (error) {
            res.status(500).json({ message: "Something went wrong" });
            return;
        }
    });
}
function validateToken(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = req.query.token;
        if (!token) {
            res.status(400).json({ error: "Token is required" });
            return;
        }
        try {
            const tokenRecord = yield dbConnect_1.prisma.emailVerificationToken.findUnique({
                where: {
                    token,
                },
            });
            if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
                res.status(400).json({ error: "Token is invalid or expired" });
                return;
            }
            res.status(200).json({ message: "Token is valid" });
            return;
        }
        catch (error) {
            res.status(500).json({ error: "Server error" });
            return;
        }
    });
}
function refreshAccessToken(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const RefreshPublicKey = process.env.REFRESH_PUBLIC_KEY;
        const privateKey = process.env.PRIVATE_KEY;
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(401).json({ error: "Refresh Token expired. Login Again" });
            return;
        }
        let decoded = null;
        try {
            decoded = jsonwebtoken_1.default.verify(refreshToken, RefreshPublicKey, {
                algorithms: ["RS256"],
            });
        }
        catch (error) {
            res.status(403).json({ error: "Invalid refresh token" });
            return;
        }
        const user = yield dbConnect_1.prisma.user.findUnique({ where: { id: decoded.sub } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        if (user.tokenVersion !== decoded.version) {
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
            });
            res.status(401).json({ error: "outdated token version" });
            return;
        }
        console.log("generating new access token");
        const newAccessToken = jsonwebtoken_1.default.sign({
            sub: user.id,
            isVerified: user.verified,
            email: user.email,
            role: user.role,
        }, privateKey, {
            algorithm: "RS256",
            expiresIn: "15m", // ✅ Shorter duration
        });
        console.log("new token given");
        res.status(200).json({ accessToken: newAccessToken });
        return;
    });
}
function logout(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const publicKey = process.env.PUBLIC_KEY;
        const refreshSecret = process.env.REFRESH_PUBLIC_KEY;
        const privateKey = process.env.PRIVATE_KEY;
        const refreshPrivateKey = process.env.REFRESH_PRIVATE_KEY;
        let userId = null;
        // 🔹 Try to extract user ID from access token (if still valid)
        const authHeader = req.headers.authorization;
        if (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            try {
                const decoded = jsonwebtoken_1.default.verify(token, publicKey, {
                    algorithms: ["RS256"],
                });
                userId = decoded.sub;
            }
            catch (error) {
                console.log("⚠️ Access token expired or invalid. Falling back to refresh token.");
            }
        }
        // 🔹 If access token is expired, check refresh token instead
        if (!userId && req.cookies.refreshToken) {
            try {
                const decoded = jsonwebtoken_1.default.verify(req.cookies.refreshToken, refreshSecret);
                userId = decoded.sub;
            }
            catch (error) {
                console.log("❌ Invalid refresh token. Cannot update token version.");
            }
        }
        // 🔹 If we have a valid user ID, increment tokenVersion
        if (userId) {
            console.log("updating token version");
            yield dbConnect_1.prisma.user.update({
                where: { id: userId },
                data: { tokenVersion: { increment: 1 } }, // 🚀 Invalidate old refresh tokens
            });
        }
        // 🔹 Clear the refresh token properly
        res.cookie("refreshToken", "", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            expires: new Date(0), // 🔥 Expire it instantly
            path: "/", // Match original path
        });
        console.log("logged out successfully");
        res.status(200).json({ message: "Logged out successfully" });
        return;
    });
}
