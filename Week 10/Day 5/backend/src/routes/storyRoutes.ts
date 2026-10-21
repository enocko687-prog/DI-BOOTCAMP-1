import { Router } from "express";
import {
  getStory,
  getStoryComments,
  getStories,
  getStoryRevisions,
  patchStory,
  postStory,
  postStoryComment,
  removeStory,
} from "../controllers/storyController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();
router.use(authenticate);
router.get("/", getStories);
router.post("/", postStory);
router.get("/:id/comments", getStoryComments);
router.post("/:id/comments", postStoryComment);
router.get("/:id/versions", getStoryRevisions);
router.get("/:id", getStory);
router.patch("/:id", patchStory);
router.delete("/:id", removeStory);

export default router;
