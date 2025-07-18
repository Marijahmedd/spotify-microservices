"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const server = (0, express_1.default)();
if (!process.env.PRIVATE_KEY ||
    !process.env.REFRESH_PRIVATE_KEY /* || other critical vars */) {
    console.error("FATAL ERROR: Essential environment variables are missing! Check your .env file and ensure dotenv is loaded correctly.");
    process.exit(1);
}
server.use((0, cors_1.default)({
    origin: `${process.env.BASE_URL}`,
    credentials: true,
}));
console.log("Allowed origin:", process.env.BASE_URL);
server.use((0, cookie_parser_1.default)());
server.use(app_1.default); // ✅ CORRECT — using the app instance (with all routes and middleware)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});
