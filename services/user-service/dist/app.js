"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = require("./routes/auth.routes");
const app = (0, express_1.default)();
app.use(express_1.default.json()); // middleware to parse JSON
// enqueueEmailJob("verify", "muhammadmarijahmed@gmail.com", "testing-token");
app.use("/api/user", auth_routes_1.userRouter);
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});
exports.default = app;
