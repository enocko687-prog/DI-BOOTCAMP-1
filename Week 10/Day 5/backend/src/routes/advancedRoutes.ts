import { Router } from "express";
import { addComment, createShare, editComment, getComments, profile, readShare, reactToComment, removeComment, restoreVersion, toggleComments, updateProfile } from "../controllers/advancedController.js";
import { authenticate } from "../middleware/authenticate.js";

export const advancedRoutes = Router();
advancedRoutes.get("/share/:token", readShare);
advancedRoutes.use(authenticate);
advancedRoutes.get("/profile", profile);
advancedRoutes.patch("/profile", updateProfile);
advancedRoutes.post("/comments", addComment);
advancedRoutes.get("/comments/:story_id", getComments);
advancedRoutes.patch("/comments/:id", editComment);
advancedRoutes.delete("/comments/:id", removeComment);
advancedRoutes.post("/comments/:id/reactions", reactToComment);
advancedRoutes.patch("/stories/:id/comments", toggleComments);
advancedRoutes.post("/stories/:storyId/versions/:versionId/restore", restoreVersion);
advancedRoutes.post("/stories/:id/share", createShare);
