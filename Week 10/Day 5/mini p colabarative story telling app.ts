export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Contributor {
  id: number;
  userId: number;
  username: string;
  email: string;
}

export interface Story {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorUsername: string;
  createdAt: string;
  updatedAt: string;
  contributors: Contributor[];
  commentsEnabled: boolean;
}

export interface StoryComment {
  id: number;
  storyId: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
  reactions: CommentReaction[];
}

export interface StoryRevision {
  id: number;
  storyId: number;
  editorId: number;
  editorUsername: string;
  title: string;
  content: string;
  savedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface CommentReaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

export interface UserProfile extends User {
  avatarUrl: string | null;
  createdStories: Story[];
  contributedStories: Story[];
}