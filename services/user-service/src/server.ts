// src/server.ts
import express from "express";
import dotenv from "dotenv";
import app from "./app";
import cookieParser from "cookie-parser";
import cors from "cors";
dotenv.config();

const server = express();
if (
  !process.env.PRIVATE_KEY ||
  !process.env.REFRESH_PRIVATE_KEY /* || other critical vars */
) {
  console.error(
    "FATAL ERROR: Essential environment variables are missing! Check your .env file and ensure dotenv is loaded correctly."
  );
  process.exit(1);
}

server.use(
  cors({
    origin: `${process.env.BASE_URL}`,
    credentials: true,
  })
);
console.log("Allowed origin:", process.env.BASE_URL);

server.use(cookieParser());
server.use(app); // ✅ CORRECT — using the app instance (with all routes and middleware)

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
