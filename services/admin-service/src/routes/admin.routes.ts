import express from "express";
import { test, testS3, uploadURL } from "../controller/admin.controller";
export const adminRouter = express.Router();

adminRouter.post("/test", test);
adminRouter.post("/test-s3", testS3);
adminRouter.post("/upload-url", uploadURL);
