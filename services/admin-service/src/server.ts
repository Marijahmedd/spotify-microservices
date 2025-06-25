// src/server.ts
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

import app from "./app";
const server = express();
if (!process.env.PUBLIC_KEY) {
  console.error(
    "FATAL ERROR: Essential environment variables are missing! Check your .env file and ensure dotenv is loaded correctly."
  );
  process.exit(1);
}

// server.use(
//   cors({
//     origin: `${process.env.BASE_URL}`,
//     credentials: true,
//   })
// );

server.use(cookieParser());
server.use(app); // ✅ CORRECT — using the app instance (with all routes and middleware)

const PORT = process.env.PORT || 6000;

server.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
