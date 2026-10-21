import { pool } from "../db/pool.js";

export interface StoryRow {
  id: number;
  title: string;
  content: string;
  author_id: number;
  author_username: string;
  created_at: Date;
  updated_at: Date;
  comments_enabled: boolean;
  contributors: Array<{ id: number; userId: number; username: string; email: string }>;
}

const storySelect = `
  SELECT s.id, s.title, s.content, s.author_id, u.username AS author_username,
         s.created_at, s.updated_at, s.comments_enabled,
         COALESCE(
           (SELECT jsonb_agg(jsonb_build_object(
             'id', c.id, 'userId', cu.id, 'username', cu.username, 'email', cu.email
           ) ORDER BY cu.username)
            FROM contributors c JOIN users cu ON cu.id = c.user_id
            WHERE c.story_id = s.id),
           '[]'::jsonb
         ) AS contributors
  FROM stories s
  JOIN users u ON u.id = s.author_id`;

export async function listStories(userId: number, mineOnly: boolean): Promise<StoryRow[]> {
  const result = await pool.query<StoryRow>(
    `${storySelect}
     WHERE NOT $2 OR s.author_id = $1 OR EXISTS (
       SELECT 1 FROM contributors c WHERE c.story_id = s.id AND c.user_id = $1
     )
     ORDER BY s.updated_at DESC`,
    [userId, mineOnly],
  );
  return result.rows;
}

export async function findStory(id: number): Promise<StoryRow | undefined> {
  const result = await pool.query<StoryRow>(`${storySelect} WHERE s.id = $1`, [id]);
  return result.rows[0];
}

export async function createStory(
  title: string,
  content: string,
  authorId: number,
): Promise<StoryRow> {
  const result = await pool.query<{ id: number }>(
    "INSERT INTO stories (title, content, author_id) VALUES ($1, $2, $3) RETURNING id",
    [title, content, authorId],
  );
  return (await findStory(result.rows[0].id))!;
}

export async function canEditStory(storyId: number, userId: number): Promise<boolean> {
  const result = await pool.query(
    `SELECT 1 FROM stories s
     WHERE s.id = $1 AND (
       s.author_id = $2 OR EXISTS (
         SELECT 1 FROM contributors c WHERE c.story_id = s.id AND c.user_id = $2
       )
     )`,
    [storyId, userId],
  );
  return result.rowCount === 1;
}

export async function isStoryAuthor(storyId: number, userId: number): Promise<boolean> {
  const result = await pool.query(
    "SELECT 1 FROM stories WHERE id = $1 AND author_id = $2",
    [storyId, userId],
  );
  return result.rowCount === 1;
}

export async function updateStory(
  id: number,
  title: string,
  content: string,
  editorId: number,
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const current = await client.query<{ title: string; content: string }>(
      "SELECT title, content FROM stories WHERE id = $1 FOR UPDATE",
      [id],
    );
    if (current.rows[0] &&
      (current.rows[0].title !== title || current.rows[0].content !== content)) {
      await client.query(
        `INSERT INTO story_revisions (story_id, editor_id, title, content)
         VALUES ($1, $2, $3, $4)`,
        [id, editorId, current.rows[0].title, current.rows[0].content],
      );
      await client.query(
        "UPDATE stories SET title = $1, content = $2 WHERE id = $3",
        [title, content, id],
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteStory(id: number): Promise<boolean> {
  const result = await pool.query("DELETE FROM stories WHERE id = $1", [id]);
  return result.rowCount === 1;
}

export async function addContributor(storyId: number, userId: number): Promise<void> {
  await pool.query(
    "INSERT INTO contributors (story_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [storyId, userId],
  );
}

export async function listContributors(storyId: number) {
  const result = await pool.query(
    `SELECT c.id, u.id AS "userId", u.username, u.email
     FROM contributors c JOIN users u ON u.id = c.user_id
     WHERE c.story_id = $1 ORDER BY u.username`,
    [storyId],
  );
  return result.rows;
}

export async function findContributorStory(contributorId: number): Promise<number | undefined> {
  const result = await pool.query<{ story_id: number }>(
    "SELECT story_id FROM contributors WHERE id = $1",
    [contributorId],
  );
  return result.rows[0]?.story_id;
}

export async function deleteContributor(contributorId: number): Promise<void> {
  await pool.query("DELETE FROM contributors WHERE id = $1", [contributorId]);
}

export async function listStoryRevisions(storyId: number) {
  const result = await pool.query(
    `SELECT r.id, r.story_id AS "storyId", r.editor_id AS "editorId",
            u.username AS "editorUsername", r.title, r.content, r.saved_at AS "savedAt"
     FROM story_revisions r
     JOIN users u ON u.id = r.editor_id
     WHERE r.story_id = $1
     ORDER BY r.saved_at DESC`,
    [storyId],
  );
  return result.rows;
}

export async function listComments(storyId: number, userId = 0) {
  const result = await pool.query(
    `SELECT c.id, c.story_id AS "storyId", c.user_id AS "userId",
            u.username, c.comment_text AS content, c."timestamp" AS "createdAt",
            COALESCE((SELECT jsonb_agg(jsonb_build_object(
              'emoji', reactions.emoji, 'count', reactions.count,
              'reacted', reactions.reacted
            )) FROM (
              SELECT emoji, COUNT(*)::int AS count,
                     BOOL_OR(user_id = $2) AS reacted
              FROM comment_reactions WHERE comment_id = c.id GROUP BY emoji
            ) reactions), '[]'::jsonb) AS reactions
     FROM comments c JOIN users u ON u.id = c.user_id
     WHERE c.story_id = $1 ORDER BY c.created_at ASC`,
    [storyId, userId],
  );
  return result.rows;
}

export async function addComment(storyId: number, userId: number, content: string) {
  const result = await pool.query<{ id: number }>(
    "INSERT INTO comments (story_id, user_id, content, comment_text) VALUES ($1, $2, $3, $3) RETURNING id",
    [storyId, userId, content],
  );
  const comments = await listComments(storyId, userId);
  return comments.find((comment) => comment.id === result.rows[0].id);
}

export async function updateComment(commentId: number, content: string): Promise<void> {
  await pool.query('UPDATE comments SET comment_text = $1, content = $1 WHERE id = $2', [content, commentId]);
}

export async function deleteComment(commentId: number): Promise<void> {
  await pool.query("DELETE FROM comments WHERE id = $1", [commentId]);
}

export async function findComment(commentId: number) {
  const result = await pool.query<{ id: number; story_id: number; user_id: number }>(
    "SELECT id, story_id, user_id FROM comments WHERE id = $1",
    [commentId],
  );
  return result.rows[0];
}

export async function toggleCommentReaction(commentId: number, userId: number, emoji: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existing = await client.query(
      "DELETE FROM comment_reactions WHERE comment_id = $1 AND user_id = $2 AND emoji = $3 RETURNING id",
      [commentId, userId, emoji],
    );
    if (existing.rowCount === 0) {
      await client.query(
        "INSERT INTO comment_reactions (comment_id, user_id, emoji) VALUES ($1, $2, $3)",
        [commentId, userId, emoji],
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function setStoryCommentsEnabled(storyId: number, enabled: boolean) {
  await pool.query("UPDATE stories SET comments_enabled = $1 WHERE id = $2", [enabled, storyId]);
}

export async function restoreStoryRevision(storyId: number, revisionId: number, editorId: number) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const current = await client.query<{ title: string; content: string }>(
      "SELECT title, content FROM stories WHERE id = $1 FOR UPDATE", [storyId],
    );
    const revision = await client.query<{ title: string; content: string }>(
      "SELECT title, content FROM story_revisions WHERE id = $1 AND story_id = $2",
      [revisionId, storyId],
    );
    if (!current.rows[0] || !revision.rows[0]) {
      await client.query("ROLLBACK");
      return false;
    }
    await client.query(
      "INSERT INTO story_revisions (story_id, editor_id, title, content) VALUES ($1,$2,$3,$4)",
      [storyId, editorId, current.rows[0].title, current.rows[0].content],
    );
    await client.query(
      "UPDATE stories SET title = $1, content = $2 WHERE id = $3",
      [revision.rows[0].title, revision.rows[0].content, storyId],
    );
    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function createStoryShare(storyId: number, createdBy: number, token: string) {
  const result = await pool.query(
    "INSERT INTO story_shares (story_id, created_by, token) VALUES ($1,$2,$3) RETURNING token",
    [storyId, createdBy, token],
  );
  return result.rows[0];
}

export async function getSharedStory(token: string) {
  const result = await pool.query(
    `SELECT s.id, s.title, s.content, u.username AS "authorUsername", s.created_at AS "createdAt"
     FROM story_shares sh JOIN stories s ON s.id = sh.story_id
     JOIN users u ON u.id = s.author_id WHERE sh.token = $1`,
    [token],
  );
  return result.rows[0];
}

export async function getUserProfile(userId: number) {
  const result = await pool.query(
    `SELECT id, username, email, avatar_url AS "avatarUrl" FROM users WHERE id = $1`,
    [userId],
  );
  if (!result.rows[0]) return undefined;
  const created = await listStories(userId, true);
  const contributed = await pool.query(
    `SELECT s.id, s.title, s.content, s.author_id AS "authorId",
            u.username AS "authorUsername", s.created_at AS "createdAt",
            s.updated_at AS "updatedAt", '[]'::jsonb AS contributors
     FROM stories s JOIN users u ON u.id = s.author_id
     JOIN contributors c ON c.story_id = s.id WHERE c.user_id = $1`,
    [userId],
  );
  return {
    ...result.rows[0],
    createdStories: created.filter((story) => story.author_id === userId),
    contributedStories: contributed.rows,
  };
}
