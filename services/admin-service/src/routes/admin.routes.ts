import express from "express";
import {
  createAlbum,
  createSong,
  deleteAlbum,
  getAlbum,
  getSongsOfAlbums,
  test,
  testS3,
  uploadURL,
} from "../controller/admin.controller";
export const adminRouter = express.Router();

adminRouter.post("/test", test);
adminRouter.post("/test-s3", testS3);
adminRouter.post("/upload-url", uploadURL);

adminRouter.get("/album", getAlbum);
adminRouter.post("/album", createAlbum);
adminRouter.delete("/album/:id", deleteAlbum);

adminRouter.post("/song", createSong);
adminRouter.get("/album/:id/song", getSongsOfAlbums);
