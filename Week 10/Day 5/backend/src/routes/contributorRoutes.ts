import { Router } from "express";
import {
  getContributors,
  postContributor,
  removeContributor,
} from "../controllers/storyController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();
router.use(authenticate);
router.post("/", postContributor);
router.get("/:story_id", getContributors);
router.delete("/:id", removeContributor);

export default router;
