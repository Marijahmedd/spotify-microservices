// src/app.ts
import express from "express";
import { adminRouter } from "./routes/admin.routes";
import { RequireAdmin } from "./middleware/auth";
const app = express();

app.use(express.json()); // middleware to parse JSON

// mount the blog router
app.use("/api/admin", RequireAdmin, adminRouter);
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});
export default app;
