import { randomBytes } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { pool } from "../db/pool.js";
import { createStoryShare, findComment, findStory, getSharedStory, getUserProfile, isStoryAuthor, restoreStoryRevision, toggleCommentReaction, updateComment, deleteComment } from "../models/storyModel.js";

function idOf(value: string | string[]): number | undefined {
  if (Array.isArray(value)) return undefined;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}

export async function addComment(request: Request, response: Response, next: NextFunction) {
  try {
    const storyId = idOf(String(request.body?.story_id ?? ""));
    const text = request.body?.comment_text;
    if (!storyId || typeof text !== "string" || !text.trim() || text.length > 2000) {
      response.status(400).json({ message: "story_id and comment_text (1-2000 characters) are required." });
      return;
    }
    const story = await pool.query<{ comments_enabled: boolean }>(
      "SELECT comments_enabled FROM stories WHERE id = $1", [storyId],
    );
    if (!story.rows[0]) {
      response.status(404).json({ message: "Story not found." });
      return;
    }
    if (!story.rows[0].comments_enabled) {
      response.status(403).json({ message: "Comments are disabled for this story." });
      return;
    }
    const saved = await pool.query(
      `INSERT INTO comments (story_id, user_id, content, comment_text)
       VALUES ($1, $2, $3, $3)
       RETURNING id, story_id AS "storyId", user_id AS "userId",
                 comment_text AS "commentText", "timestamp" AS timestamp`,
      [storyId, request.userId, text.trim()],
    );
    const user = await pool.query("SELECT username FROM users WHERE id = $1", [request.userId]);
    response.app.get("io")?.to(`story:${storyId}`).emit("comment:updated");
    response.status(201).json({ comment: { ...saved.rows[0], username: user.rows[0].username, reactions: [] } });
  } catch (error) { next(error); }
}

export async function getComments(request: Request, response: Response, next: NextFunction) {
  try {
    const storyId = idOf(request.params.story_id);
    if (!storyId) { response.status(400).json({ message: "Invalid story id." }); return; }
    if (!(await findStory(storyId))) { response.status(404).json({ message: "Story not found." }); return; }
    const result = await pool.query(
      `SELECT c.id, c.story_id AS "storyId", c.user_id AS "userId", u.username,
              c.comment_text AS content, c."timestamp" AS "createdAt",
              COALESCE((SELECT jsonb_agg(jsonb_build_object(
                'emoji', r.emoji, 'count', r.count, 'reacted', r.reacted
              )) FROM (SELECT emoji, COUNT(*)::int AS count,
                BOOL_OR(user_id = $2) AS reacted FROM comment_reactions
                WHERE comment_id = c.id GROUP BY emoji) r), '[]'::jsonb) AS reactions
       FROM comments c JOIN users u ON u.id = c.user_id
       WHERE c.story_id = $1 ORDER BY c."timestamp"`,
      [storyId, request.userId],
    );
    response.json({ comments: result.rows });
  } catch (error) { next(error); }
}

export async function editComment(request: Request, response: Response, next: NextFunction) {
  try {
    const id = idOf(request.params.id);
    const text = request.body?.comment_text;
    if (!id || typeof text !== "string" || !text.trim() || text.length > 2000) {
      response.status(400).json({ message: "Valid comment id and comment_text are required." });
      return;
    }
    const comment = await findComment(id);
    if (!comment) { response.status(404).json({ message: "Comment not found." }); return; }
    if (comment.user_id !== request.userId) {
      response.status(403).json({ message: "Only the comment author can edit it." });
      return;
    }
    await updateComment(id, text.trim());
    response.app.get("io")?.to(`story:${comment.story_id}`).emit("comment:updated");
    response.json({ message: "Comment updated." });
  } catch (error) { next(error); }
}

export async function removeComment(request: Request, response: Response, next: NextFunction) {
  try {
    const id = idOf(request.params.id);
    if (!id) { response.status(400).json({ message: "Invalid comment id." }); return; }
    const comment = await findComment(id);
    if (!comment) { response.status(404).json({ message: "Comment not found." }); return; }
    if (comment.user_id !== request.userId && !(await isStoryAuthor(comment.story_id, request.userId!))) {
      response.status(403).json({ message: "Only the comment or story author can delete it." });
      return;
    }
    await deleteComment(id);
    response.app.get("io")?.to(`story:${comment.story_id}`).emit("comment:updated");
    response.status(204).end();
  } catch (error) { next(error); }
}

export async function reactToComment(request: Request, response: Response, next: NextFunction) {
  try {
    const id = idOf(request.params.id);
    const emoji = request.body?.emoji;
    if (!id || typeof emoji !== "string" || !["❤️", "👏", "😂", "✨", "👍"].includes(emoji)) {
      response.status(400).json({ message: "Choose a supported reaction." });
      return;
    }
    if (!(await findComment(id))) { response.status(404).json({ message: "Comment not found." }); return; }
    await toggleCommentReaction(id, request.userId!, emoji);
    const comment = await findComment(id);
    if (comment) response.app.get("io")?.to(`story:${comment.story_id}`).emit("comment:updated");
    response.json({ message: "Reaction updated." });
  } catch (error) { next(error); }
}

export async function toggleComments(request: Request, response: Response, next: NextFunction) {
  try {
    const storyId = idOf(request.params.id);
    const enabled = request.body?.enabled;
    if (!storyId || typeof enabled !== "boolean") {
      response.status(400).json({ message: "A story id and boolean enabled value are required." });
      return;
    }
    if (!(await findStory(storyId))) { response.status(404).json({ message: "Story not found." }); return; }
    if (!(await isStoryAuthor(storyId, request.userId!))) {
      response.status(403).json({ message: "Only the story author can change comment settings." });
      return;
    }
    await pool.query("UPDATE stories SET comments_enabled = $1 WHERE id = $2", [enabled, storyId]);
    response.json({ commentsEnabled: enabled });
  } catch (error) { next(error); }
}

export async function restoreVersion(request: Request, response: Response, next: NextFunction) {
  try {
    const storyId = idOf(request.params.storyId);
    const versionId = idOf(request.params.versionId);
    if (!storyId || !versionId) { response.status(400).json({ message: "Invalid story or version id." }); return; }
    if (!(await isStoryAuthor(storyId, request.userId!))) {
      response.status(403).json({ message: "Only the story author can restore versions." });
      return;
    }
    const restored = await restoreStoryRevision(storyId, versionId, request.userId!);
    if (!restored) { response.status(404).json({ message: "Version not found." }); return; }
    response.app.get("io")?.to(`story:${storyId}`).emit("story:updated", {
      story: await findStory(storyId),
    });
    response.json({ message: "Version restored." });
  } catch (error) { next(error); }
}

export async function createShare(request: Request, response: Response, next: NextFunction) {
  try {
    const storyId = idOf(request.params.id);
    if (!storyId || !(await findStory(storyId))) {
      response.status(404).json({ message: "Story not found." }); return;
    }
    const token = randomBytes(24).toString("base64url");
    await createStoryShare(storyId, request.userId!, token);
    response.status(201).json({ url: `${process.env.FRONTEND_URL ?? "http://localhost:5173"}/?share=${token}` });
  } catch (error) { next(error); }
}

export async function readShare(request: Request, response: Response, next: NextFunction) {
  try {
    const token = request.params.token;
    if (Array.isArray(token)) { response.status(400).json({ message: "Invalid share link." }); return; }
    const story = await getSharedStory(token);
    if (!story) { response.status(404).json({ message: "Share link not found." }); return; }
    response.json({ story });
  } catch (error) { next(error); }
}

export async function profile(request: Request, response: Response, next: NextFunction) {
  try {
    const profile = await getUserProfile(request.userId!);
    if (!profile) { response.status(404).json({ message: "Profile not found." }); return; }
    response.json({ profile });
  } catch (error) { next(error); }
}

export async function updateProfile(request: Request, response: Response, next: NextFunction) {
  try {
    const { username, avatarUrl } = request.body ?? {};
    if (username !== undefined && (typeof username !== "string" || username.trim().length < 2 || username.trim().length > 50)) {
      response.status(400).json({ message: "Username must be 2-50 characters." }); return;
    }
    if (avatarUrl !== undefined && avatarUrl !== null &&
      (typeof avatarUrl !== "string" || !/^https:\/\/.+/i.test(avatarUrl) || avatarUrl.length > 2048)) {
      response.status(400).json({ message: "Avatar URL must be a valid HTTPS URL." }); return;
    }
    await pool.query(
      "UPDATE users SET username = COALESCE($1, username), avatar_url = COALESCE($2, avatar_url) WHERE id = $3",
      [username?.trim() ?? null, avatarUrl ?? null, request.userId],
    );
    response.json({ profile: await getUserProfile(request.userId!) });
  } catch (error) { next(error); }
}
