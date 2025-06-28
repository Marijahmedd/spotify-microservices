// src/app.ts
import express from "express";
import { userRouter } from "./routes/auth.routes";
const app = express();

app.use(express.json()); // middleware to parse JSON

// mount the blog router
app.use("/api/user", userRouter);
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});
export default app;
