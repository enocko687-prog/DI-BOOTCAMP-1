import type { NextFunction, Request, Response } from "express";
import { pool } from "../db/pool.js";
import {
  addComment,
  addContributor,
  canEditStory,
  createStory,
  deleteContributor,
  deleteStory,
  findContributorStory,
  findStory,
  isStoryAuthor,
  listComments,
  listContributors,
  listStories,
  listStoryRevisions,
  updateStory,
} from "../models/storyModel.js";
import { findUserById } from "../models/authModel.js";

function parseId(value: string | string[]): number | undefined {
  if (Array.isArray(value)) return undefined;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}

function toStory(row: Awaited<ReturnType<typeof findStory>>) {
  if (!row) return undefined;
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    authorId: row.author_id,
    authorUsername: row.author_username,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    commentsEnabled: row.comments_enabled,
    contributors: row.contributors,
  };
}

export async function getStories(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const mineOnly = request.query.mine === "true";
    const stories = await listStories(request.userId!, mineOnly);
    response.json({ stories: stories.map((story) => toStory(story)!) });
  } catch (error) {
    next(error);
  }
}

export async function getStory(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseId(request.params.id);
    if (!id) {
      response.status(400).json({ message: "Story id must be a positive integer." });
      return;
    }
    const story = toStory(await findStory(id));
    if (!story) {
      response.status(404).json({ message: "Story not found." });
      return;
    }
    response.json({ story });
  } catch (error) {
    next(error);
  }
}

export async function postStory(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const { title, content } = request.body ?? {};
    if (
      typeof title !== "string" || title.trim().length < 1 || title.trim().length > 255 ||
      typeof content !== "string" || content.trim().length < 1 || content.length > 100000
    ) {
      response.status(400).json({ message: "Title (1-255 characters) and content (1-100000 characters) are required." });
      return;
    }
    const story = await createStory(title.trim(), content.trim(), request.userId!);
    response.status(201).json({ story: toStory(story) });
  } catch (error) {
    next(error);
  }
}

export async function patchStory(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseId(request.params.id);
    const { title, content } = request.body ?? {};
    if (!id) {
      response.status(400).json({ message: "Story id must be a positive integer." });
      return;
    }
    if (
      typeof title !== "string" || title.trim().length < 1 || title.trim().length > 255 ||
      typeof content !== "string" || content.trim().length < 1 || content.length > 100000
    ) {
      response.status(400).json({ message: "Title (1-255 characters) and content (1-100000 characters) are required." });
      return;
    }
    const existing = await findStory(id);
    if (!existing) {
      response.status(404).json({ message: "Story not found." });
      return;
    }
    if (!(await canEditStory(id, request.userId!))) {
      response.status(403).json({ message: "Only the author and contributors can edit this story." });
      return;
    }
    await updateStory(id, title.trim(), content.trim(), request.userId!);
    const story = toStory(await findStory(id));
    response.app.get("io")?.to(`story:${id}`).emit("story:updated", { story });
    response.json({ story });
  } catch (error) {
    next(error);
  }
}

export async function removeStory(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseId(request.params.id);
    if (!id) {
      response.status(400).json({ message: "Story id must be a positive integer." });
      return;
    }
    const story = await findStory(id);
    if (!story) {
      response.status(404).json({ message: "Story not found." });
      return;
    }
    if (story.author_id !== request.userId) {
      response.status(403).json({ message: "Only the story author can delete it." });
      return;
    }
    await deleteStory(id);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
}

export async function postContributor(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const storyId = parseId(String(request.body?.story_id ?? ""));
    const userId = parseId(String(request.body?.user_id ?? ""));
    if (!storyId || !userId) {
      response.status(400).json({ message: "Positive story_id and user_id are required." });
      return;
    }
    const story = await findStory(storyId);
    if (!story) {
      response.status(404).json({ message: "Story not found." });
      return;
    }
    if (story.author_id !== request.userId) {
      response.status(403).json({ message: "Only the story author can add contributors." });
      return;
    }
    if (userId === story.author_id) {
      response.status(400).json({ message: "The author is already part of the story." });
      return;
    }
    const user = await findUserById(userId);
    if (!user) {
      response.status(404).json({ message: "Contributor user not found." });
      return;
    }
    await addContributor(storyId, userId);
    response.status(201).json({ contributors: await listContributors(storyId) });
  } catch (error) {
    next(error);
  }
}

export async function getContributors(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const storyId = parseId(request.params.story_id);
    if (!storyId) {
      response.status(400).json({ message: "Story id must be a positive integer." });
      return;
    }
    if (!(await findStory(storyId))) {
      response.status(404).json({ message: "Story not found." });
      return;
    }
    response.json({ contributors: await listContributors(storyId) });
  } catch (error) {
    next(error);
  }
}

export async function removeContributor(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const contributorId = parseId(request.params.id);
    if (!contributorId) {
      response.status(400).json({ message: "Contributor id must be a positive integer." });
      return;
    }
    const storyId = await findContributorStory(contributorId);
    if (!storyId) {
      response.status(404).json({ message: "Contributor not found." });
      return;
    }
    if (!(await isStoryAuthor(storyId, request.userId!))) {
      response.status(403).json({ message: "Only the story author can remove contributors." });
      return;
    }
    await deleteContributor(contributorId);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
}

export async function getStoryComments(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const storyId = parseId(request.params.id);
    if (!storyId) {
      response.status(400).json({ message: "Story id must be a positive integer." });
      return;
    }
    if (!(await findStory(storyId))) {
      response.status(404).json({ message: "Story not found." });
      return;
    }
    response.json({ comments: await listComments(storyId, request.userId!) });
  } catch (error) {
    next(error);
  }
}

export async function postStoryComment(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const storyId = parseId(request.params.id);
    const { content } = request.body ?? {};
    if (!storyId || typeof content !== "string" || content.trim().length < 1 || content.length > 2000) {
      response.status(400).json({ message: "A valid story id and comment (1-2000 characters) are required." });
      return;
    }

    if (!(await findStory(storyId))) {
      response.status(404).json({ message: "Story not found." });
      return;
    }
    const story = await findStory(storyId);
    if (!story) {
      response.status(404).json({ message: "Story not found." });
      return;
    }
    const dbStory = await pool.query<{ comments_enabled: boolean }>(
      "SELECT comments_enabled FROM stories WHERE id = $1", [storyId],
    );
    if (!dbStory.rows[0]?.comments_enabled) {
      response.status(403).json({ message: "Comments are disabled for this story." });
      return;
    }
    const comment = await addComment(storyId, request.userId!, content.trim());
    response.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
}

export async function getStoryRevisions(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const storyId = parseId(request.params.id);
    if (!storyId) {
      response.status(400).json({ message: "Story id must be a positive integer." });
      return;
    }
    if (!(await findStory(storyId))) {
      response.status(404).json({ message: "Story not found." });
      return;
    }
    if (!(await isStoryAuthor(storyId, request.userId!))) {
      response.status(403).json({ message: "Only the story author can view version history." });
      return;
    }
    response.json({ revisions: await listStoryRevisions(storyId) });
  } catch (error) {
    next(error);
  }
}
