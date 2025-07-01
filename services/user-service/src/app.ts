import express from "express";
import { userRouter } from "./routes/auth.routes";
import { enqueueEmailJob } from "./lib/sqs";
const app = express();

app.use(express.json()); // middleware to parse JSON

// enqueueEmailJob("verify", "muhammadmarijahmed@gmail.com", "testing-token");
app.use("/api/user", userRouter);
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});
export default app;
