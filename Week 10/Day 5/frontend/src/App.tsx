import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { io, type Socket } from "socket.io-client";
import type { Story, StoryComment } from "../../types";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { API_URL } from "./app/api";
import {
  initializeSession,
  loginUser,
  logoutUser,
  registerUser,
} from "./features/auth/authSlice";
import {
  addStoryComment,
  createStory,
  deleteStory,
  fetchComments,
  fetchRevisions,
  fetchStory,
  fetchStories,
  fetchProfile,
  inviteContributor,
  removeContributor,
  reactToComment,
  restoreRevision,
  setCommentsEnabled,
  updateComment,
  deleteComment,
  updateProfile,
  createShareLink,
  saveStory,
} from "./features/stories/storiesSlice";
import "./App.css";

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

function App() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const storyState = useAppSelector((state) => state.stories);
  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "mine">("all");
  const [showComposer, setShowComposer] = useState(false);
  const [editing, setEditing] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [emailToInvite, setEmailToInvite] = useState("");
  const [commentText, setCommentText] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [avatarDraft, setAvatarDraft] = useState("");
  const [sharedStory, setSharedStory] = useState<{ title: string; content: string; authorUsername: string } | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [remoteCursor, setRemoteCursor] = useState<number | null>(null);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    void dispatch(initializeSession());
  }, [dispatch]);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("share");
    if (!token) return;
    fetch(`${API_URL}/share/${encodeURIComponent(token)}`)
      .then(async (response) => {
        const result = await response.json() as { story?: { title: string; content: string; authorUsername: string }; message?: string };
        if (!response.ok || !result.story) throw new Error(result.message ?? "Share link is invalid.");
        setSharedStory(result.story);
      })
      .catch((error: unknown) => setShareError(error instanceof Error ? error.message : "Unable to load shared story."));
  }, []);

  useEffect(() => {
    if (auth.accessToken) {
      void dispatch(fetchStories({ mine: filter === "mine" }));
    }
  }, [auth.accessToken, dispatch, filter]);

  const selectedStory = storyState.stories.find((story) => story.id === selectedStoryId) ?? null;
  const ownStories = useMemo(
    () => storyState.stories.filter((story) => story.authorId === auth.user?.id).length,
    [auth.user?.id, storyState.stories],
  );
  const canJoinStory = Boolean(selectedStory && auth.user && (
    selectedStory.authorId === auth.user.id ||
    selectedStory.contributors.some((person) => person.userId === auth.user?.id)
  ));

  useEffect(() => {
    if (selectedStoryId && auth.accessToken) {
      void dispatch(fetchComments(selectedStoryId));
      if (selectedStory?.authorId === auth.user?.id) void dispatch(fetchRevisions(selectedStoryId));
    }
  }, [auth.accessToken, auth.user?.id, dispatch, selectedStory?.authorId, selectedStoryId]);

  useEffect(() => {
    if (!selectedStoryId || !auth.accessToken || !canJoinStory) return;
    const socket: Socket = io(API_URL.replace(/\/api\/?$/, ""), { auth: { token: auth.accessToken } });
    socketRef.current = socket;
    socket.emit("story:join", selectedStoryId);
    socket.on("story:updated", () => { void dispatch(fetchStory(selectedStoryId)); });
    socket.on("comment:updated", () => { void dispatch(fetchComments(selectedStoryId)); });
    socket.on("story:cursor", (cursor: { userId: number; position: number }) => {
      if (cursor.userId !== auth.user?.id) setRemoteCursor(cursor.position);
    });
    return () => { socketRef.current = null; socket.disconnect(); setRemoteCursor(null); };
  }, [auth.accessToken, auth.user?.id, canJoinStory, dispatch, selectedStoryId]);

  if (auth.status === "checking") {
    return <main className="loading-screen"><span className="loader" /> Restoring your session…</main>;
  }

  if (sharedStory) {
    return <main className="shared-story"><a className="brand" href="/"><span className="brand-mark">✳</span><span>Story<span className="brand-light">Weave</span></span></a><article><div className="eyebrow">A STORY BY {sharedStory.authorUsername.toUpperCase()}</div><h1>{sharedStory.title}</h1><div>{sharedStory.content.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><a className="primary-button" href="/">Start your own story →</a></article></main>;
  }

  if (!auth.user || !auth.accessToken) {
    return <>{shareError && <div className="share-error">{shareError}</div>}<AuthScreen
      busy={auth.status === "loading"}
      error={auth.error}
      onLogin={(email, password) => void dispatch(loginUser({ email, password }))}
      onRegister={(username, email, password) => void dispatch(registerUser({ username, email, password }))}
    /></>;
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = await dispatch(createStory({
      title: String(data.get("title") ?? ""),
      content: String(data.get("content") ?? ""),
    }));
    if (createStory.fulfilled.match(result)) {
      setShowComposer(false);
      setSelectedStoryId(result.payload.id);
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedStory) return;
    const data = new FormData(event.currentTarget);
    const result = await dispatch(saveStory({
      id: selectedStory.id,
      title: String(data.get("title") ?? ""),
      content: String(data.get("content") ?? ""),
    }));
    if (saveStory.fulfilled.match(result)) {
      setEditing(false);
      void dispatch(fetchRevisions(selectedStory.id));
    }
  }

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedStory || !emailToInvite.trim()) return;
    const result = await dispatch(inviteContributor({ storyId: selectedStory.id, email: emailToInvite.trim() }));
    if (inviteContributor.fulfilled.match(result)) setEmailToInvite("");
  }

  async function handleComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedStory || !commentText.trim()) return;
    const result = await dispatch(addStoryComment({ storyId: selectedStory.id, content: commentText.trim() }));
    if (addStoryComment.fulfilled.match(result)) setCommentText("");
  }

  async function handleShare() {
    if (!selectedStory) return;
    const result = await dispatch(createShareLink(selectedStory.id));
    if (createShareLink.fulfilled.match(result)) {
      setShareUrl(result.payload);
      await navigator.clipboard.writeText(result.payload);
      window.alert("Share link copied to clipboard.");
    }
  }

  const storyError = storyState.error;
  const canEdit = selectedStory && (
    selectedStory.authorId === auth.user.id ||
    selectedStory.contributors.some((contributor) => contributor.userId === auth.user?.id)
  );
  const isAuthor = selectedStory?.authorId === auth.user.id;

  return (
    <div className={`app-shell ${theme}`} data-theme={theme}>
      <aside className="sidebar">
        <a className="brand" href="#" onClick={() => setSelectedStoryId(null)}>
          <span className="brand-mark">✳</span><span>Story<span className="brand-light">Weave</span></span>
        </a>
        <div className="workspace-label">YOUR WORKSPACE</div>
        <button className={`nav-link ${filter === "all" ? "active" : ""}`} onClick={() => { setFilter("all"); setSelectedStoryId(null); }}>
          <span>▦</span> All stories <span className="nav-count">{storyState.stories.length}</span>
        </button>
        <button className={`nav-link ${filter === "mine" ? "active" : ""}`} onClick={() => { setFilter("mine"); setSelectedStoryId(null); }}>
          <span>▤</span> My stories <span className="nav-count">{ownStories}</span>
        </button>
        <div className="sidebar-bottom">
          <div className="tip-card"><span className="tip-icon">✦</span><strong>Good stories grow together.</strong><p>Invite a collaborator and build something wonderful.</p></div>
          <button className="nav-link" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}><span>{theme === "dark" ? "☼" : "☾"}</span> Switch to {theme === "dark" ? "light" : "dark"} mode</button>
          <div className="profile-row">
            <div className="avatar">{initials(auth.user.username)}</div>
            <div className="profile-copy"><strong>{auth.user.username}</strong><span>{auth.user.email}</span></div>
            <button className="icon-button" title="Profile" onClick={() => { void dispatch(fetchProfile()); setShowProfile(true); }}>♙</button>
            <button className="icon-button" title="Sign out" onClick={() => void dispatch(logoutUser())}>↪</button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> {selectedStory ? "Story" : filter === "mine" ? "My stories" : "All stories"}</div>
          <div className="topbar-right"><span className="online-dot" /> Your stories are saved as you go <button className="mobile-theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>◐</button></div>
        </header>

        <section className="page-content">
          {selectedStory ? (
            <StoryDetail
              story={selectedStory}
              currentUserId={auth.user.id}
              comments={storyState.comments}
              revisions={storyState.revisions}
              canEdit={Boolean(canEdit)}
              isAuthor={Boolean(isAuthor)}
              editing={editing}
              inviteEmail={emailToInvite}
              commentText={commentText}
              error={storyError}
              loading={storyState.loading}
              onBack={() => { setSelectedStoryId(null); setEditing(false); }}
              onEdit={() => setEditing(true)}
              onDelete={() => {
                if (window.confirm("Delete this story permanently?")) {
                  void dispatch(deleteStory(selectedStory.id)).then(() => setSelectedStoryId(null));
                }
              }}
              onSave={handleSave}
              onInvite={handleInvite}
              onInviteEmailChange={setEmailToInvite}
              onComment={handleComment}
              onCommentChange={setCommentText}
              onRemoveContributor={(contributorId) => void dispatch(removeContributor({ storyId: selectedStory.id, contributorId }))}
              onReact={(commentId, emoji) => void dispatch(reactToComment({ commentId, emoji }))}
              onEditComment={(id, content) => void dispatch(updateComment({ id, comment_text: content, storyId: selectedStory.id })).then(() => dispatch(fetchComments(selectedStory.id)))}
              onDeleteComment={(id) => void dispatch(deleteComment({ id, storyId: selectedStory.id })).then(() => dispatch(fetchComments(selectedStory.id)))}
              onToggleComments={(enabled) => void dispatch(setCommentsEnabled({ storyId: selectedStory.id, enabled })).then(() => dispatch(fetchStory(selectedStory.id)))}
              onRestore={(revisionId) => void dispatch(restoreRevision({ storyId: selectedStory.id, revisionId })).then(() => { dispatch(fetchStory(selectedStory.id)); dispatch(fetchRevisions(selectedStory.id)); })}
              onShare={() => void handleShare()}
              shareUrl={shareUrl}
              remoteCursor={remoteCursor}
              onCursor={(position) => socketRef.current?.emit("story:cursor", { storyId: selectedStory.id, position })}
            />
          ) : (
            <>
              <div className="welcome-row">
                <div><div className="eyebrow">A LITTLE INSPIRATION GOES A LONG WAY</div><h1>{filter === "mine" ? "Your stories" : "Stories worth sharing"}</h1><p className="subtitle">A space for ideas to find their next chapter.</p></div>
                <button className="primary-button" onClick={() => setShowComposer(true)}><span>＋</span> New story</button>
              </div>
              <div className="stats-strip">
                <div className="stat"><span className="stat-icon lilac">✎</span><div><strong>{storyState.stories.length}</strong><span>Stories in your space</span></div></div>
                <div className="stat"><span className="stat-icon amber">✦</span><div><strong>{ownStories}</strong><span>Started by you</span></div></div>
                <div className="stat"><span className="stat-icon mint">↗</span><div><strong>{storyState.stories.reduce((sum, story) => sum + story.contributors.length, 0)}</strong><span>Collaborators</span></div></div>
                <div className="stat-quote">“Stories are a communal currency of humanity.”<span>— Tahir Shah</span></div>
              </div>
              {storyError && <div className="alert error">{storyError}</div>}
              <div className="section-heading"><div><h2>{filter === "mine" ? "Your collection" : "The story garden"}</h2><p>Pick up where you left off, or discover something new.</p></div><span className="story-total">{storyState.stories.length} {storyState.stories.length === 1 ? "STORY" : "STORIES"}</span></div>
              {storyState.loading && storyState.stories.length === 0 ? <div className="empty-state"><span className="loader" /><p>Finding your stories…</p></div> :
                storyState.stories.length === 0 ? <div className="empty-state"><div className="empty-book">✧</div><h3>Your first chapter starts here.</h3><p>Create a story, then invite someone to help it grow.</p><button className="primary-button" onClick={() => setShowComposer(true)}>＋ Write a story</button></div> :
                  <div className="story-grid">{storyState.stories.map((story, index) => <StoryCard key={story.id} story={story} index={index} onClick={() => setSelectedStoryId(story.id)} />)}</div>}
            </>
          )}
        </section>
      </main>

      {showComposer && <Modal title="Start a new story" onClose={() => setShowComposer(false)}>
        <form className="form-stack" onSubmit={handleCreate}>
          {storyError && <div className="alert error">{storyError}</div>}
          <label>Story title<input name="title" required maxLength={255} placeholder="A title that draws you in" /></label>
          <label>Opening chapter<textarea name="content" required rows={7} maxLength={100000} placeholder="Every great story begins somewhere…" /></label>
          <div className="form-actions"><button type="button" className="quiet-button" onClick={() => setShowComposer(false)}>Cancel</button><button className="primary-button" disabled={storyState.loading}>Create story <span>→</span></button></div>
        </form>
      </Modal>}
      {showProfile && <Modal title="Your profile" onClose={() => setShowProfile(false)}>
        <div className="profile-modal">
          <div className="avatar profile-large">{initials(storyState.profile?.username ?? auth.user.username)}</div>
          <h3>{storyState.profile?.username ?? auth.user.username}</h3><p>{storyState.profile?.email ?? auth.user.email}</p>
          {storyState.profile?.avatarUrl && <img className="profile-image" src={storyState.profile.avatarUrl} alt="Profile avatar" />}
          <label className="avatar-upload">Upload avatar<input type="file" accept="image/png,image/jpeg,image/webp" onChange={async (event) => {
            const file = event.currentTarget.files?.[0];
            const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
            const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;
            if (!file) return;
            if (!cloud || !preset) { setAvatarUploadError("Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to enable uploads."); return; }
            if (file.size > 5 * 1024 * 1024) { setAvatarUploadError("Choose an image smaller than 5 MB."); return; }
            const form = new FormData(); form.append("file", file); form.append("upload_preset", preset);
            try {
              const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`, { method: "POST", body: form });
              const result = await response.json() as { secure_url?: string; error?: { message?: string } };
              if (!response.ok || !result.secure_url) throw new Error(result.error?.message ?? "Cloudinary upload failed.");
              const saved = await dispatch(updateProfile({ avatarUrl: result.secure_url }));
              if (updateProfile.rejected.match(saved)) throw new Error(saved.payload ?? "Unable to save avatar.");
              setAvatarUploadError(null);
            } catch (error) { setAvatarUploadError(error instanceof Error ? error.message : "Avatar upload failed."); }
          }} /></label>
          {avatarUploadError && <div className="alert error">{avatarUploadError}</div>}
          <form className="invite-form" onSubmit={(event) => {
            event.preventDefault();
            if (!avatarDraft.trim()) return;
            void dispatch(updateProfile({ avatarUrl: avatarDraft }));
            setAvatarDraft("");
          }}><label htmlFor="avatar-url">Avatar image URL (HTTPS)</label><div><input id="avatar-url" type="url" placeholder="https://…" value={avatarDraft} onChange={(event) => setAvatarDraft(event.target.value)} /><button>Save</button></div></form>
          <p className="profile-stat">{storyState.profile?.createdStories.length ?? 0} stories created · {storyState.profile?.contributedStories.length ?? 0} stories contributed to</p>
          <div className="profile-story-list">{[...(storyState.profile?.createdStories ?? []), ...(storyState.profile?.contributedStories ?? [])].map((story) => <span key={`${story.id}-${story.authorId}`}>{story.title}</span>)}</div>
        </div>
      </Modal>}
    </div>
  );
}

function StoryCard({ story, index, onClick }: { story: Story; index: number; onClick: () => void }) {
  const palettes = ["rose", "blue", "gold", "green"];
  const palette = palettes[index % palettes.length];
  return <button className="story-card" onClick={onClick}>
    <div className={`card-art ${palette}`}><span className="art-orbit orbit-one" /><span className="art-orbit orbit-two" /><span className="art-symbol">{["✧", "☾", "✺", "⌘"][index % 4]}</span><span className="art-caption">VOL. {String(index + 1).padStart(2, "0")}</span></div>
    <div className="card-copy"><div className="card-meta"><span>{story.contributors.length > 0 ? "COLLABORATION" : "STORY"}</span><span>{new Date(story.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span></div><h3>{story.title}</h3><p>{story.content}</p><div className="card-footer"><div className="avatar-stack"><span className="mini-avatar">{initials(story.authorUsername)}</span>{story.contributors.slice(0, 3).map((person) => <span className="mini-avatar collaborator" key={person.id}>{initials(person.username)}</span>)}{story.contributors.length > 3 && <span className="mini-avatar more">+{story.contributors.length - 3}</span>}</div><span className="read-link">Open story <span>↗</span></span></div></div>
  </button>;
}

function StoryDetail(props: {
  story: Story; currentUserId: number; comments: StoryComment[];
  revisions: { id: number; editorUsername: string; title: string; content: string; savedAt: string }[];
  canEdit: boolean; isAuthor: boolean; editing: boolean; inviteEmail: string; commentText: string; error: string | null;
  loading: boolean; onBack: () => void; onEdit: () => void; onDelete: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void; onInvite: (event: FormEvent<HTMLFormElement>) => void;
  onInviteEmailChange: (value: string) => void; onComment: (event: FormEvent<HTMLFormElement>) => void;
  onCommentChange: (value: string) => void; onRemoveContributor: (id: number) => void;
  onReact: (commentId: number, emoji: string) => void;
  onEditComment: (id: number, content: string) => void;
  onDeleteComment: (id: number) => void;
  onToggleComments: (enabled: boolean) => void;
  onRestore: (revisionId: number) => void;
  onShare: () => void;
  shareUrl: string;
  remoteCursor: number | null;
  onCursor: (position: number) => void;
}) {
  const { story } = props;
  return <div className="detail-page">
    <button className="back-link" onClick={props.onBack}>← Back to stories</button>
    <div className="detail-top"><div><div className="eyebrow">A STORY BY {story.authorUsername.toUpperCase()}</div><h1>{story.title}</h1><p className="subtitle">Last woven {new Date(story.updatedAt).toLocaleString()}</p></div>
      <div className="detail-actions"><button className="secondary-button" onClick={props.onShare}>↗ Copy share link</button>{props.shareUrl && <><a className="secondary-button" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(props.shareUrl)}&text=${encodeURIComponent(story.title)}`} target="_blank" rel="noreferrer">Share on X</a><a className="secondary-button" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.shareUrl)}`} target="_blank" rel="noreferrer">Facebook</a></>}{props.canEdit && !props.editing && <button className="secondary-button" onClick={props.onEdit}>✎ Edit story</button>}{props.isAuthor && <button className="danger-button" onClick={props.onDelete}>Delete</button>}</div></div>
    {props.error && <div className="alert error">{props.error}</div>}
    <div className="detail-layout"><div className="story-paper">
      {props.editing ? <form className="form-stack" onSubmit={props.onSave}><label>Title<input name="title" required maxLength={255} defaultValue={story.title} /></label><label>Story<textarea name="content" required rows={18} maxLength={100000} defaultValue={story.content} onSelect={(event) => props.onCursor(event.currentTarget.selectionStart)} /></label>{props.remoteCursor !== null && <p className="muted">A collaborator is writing near character {props.remoteCursor}.</p>}<div className="form-actions"><button type="button" className="quiet-button" onClick={props.onBack}>Cancel</button><button className="primary-button" disabled={props.loading}>Save changes</button></div></form> :
      <><div className="paper-heading"><span>CHAPTER ONE</span><span>✦</span><span>✦</span></div><div className="story-body">{story.content.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><div className="paper-end">— ✧ —</div></>}
    </div><aside className="detail-aside"><div className="aside-card"><div className="aside-title"><div><span className="eyebrow">THE WRITING CIRCLE</span><h3>Contributors <span>{story.contributors.length + 1}</span></h3></div><span className="online-dot" /></div><div className="contributor"><div className="avatar">{initials(story.authorUsername)}</div><div><strong>{story.authorUsername}</strong><span>Author</span></div><span className="role-pill">AUTHOR</span></div>{story.contributors.map((person) => <div className="contributor" key={person.id}><div className="avatar soft">{initials(person.username)}</div><div><strong>{person.username}</strong><span>Collaborator</span></div>{props.isAuthor && <button className="remove-person" title="Remove contributor" onClick={() => props.onRemoveContributor(person.id)}>×</button>}</div>)}
      {props.isAuthor && <form className="invite-form" onSubmit={props.onInvite}><label htmlFor="invite-email">Invite by email</label><div><input id="invite-email" type="email" required placeholder="writer@example.com" value={props.inviteEmail} onChange={(event) => props.onInviteEmailChange(event.target.value)} /><button aria-label="Invite contributor" disabled={props.loading}>＋</button></div><small>The person must already have an account.</small></form>}
      {props.isAuthor && <label className="comments-toggle"><input type="checkbox" checked={story.commentsEnabled} onChange={(event) => props.onToggleComments(event.target.checked)} /> Comments enabled</label>}
    </div></aside></div>
    {props.isAuthor && props.revisions.length > 0 && <section className="revision-section"><div className="section-heading"><div><h2>Earlier chapters</h2><p>Previous saved drafts, kept for safekeeping.</p></div><span className="story-total">{props.revisions.length} VERSIONS</span></div><div className="revision-list">{props.revisions.map((revision) => <details className="revision-item" key={revision.id}><summary><span><strong>{revision.title}</strong><small>Saved by {revision.editorUsername} · {new Date(revision.savedAt).toLocaleString()}</small></span><span>＋</span></summary><div className="revision-content">{revision.content}</div><button className="secondary-button" onClick={() => { if (window.confirm("Restore this saved version?")) props.onRestore(revision.id); }}>Restore this version</button></details>)}</div></section>}
    <section className="comments-section"><div className="section-heading"><div><h2>Marginalia</h2><p>Little thoughts along the way.</p></div><span className="story-total">{props.comments.length} NOTES</span></div><div className="comment-list">{props.comments.map((comment) => <article className="comment" key={comment.id}><div className="avatar soft">{initials(comment.username)}</div><div><div className="comment-meta"><strong>{comment.username}</strong><span>{new Date(comment.createdAt).toLocaleString()}</span></div><p>{comment.content}</p><div className="comment-actions">{comment.reactions?.map((reaction) => <button className={reaction.reacted ? "reaction reacted" : "reaction"} key={reaction.emoji} onClick={() => props.onReact(comment.id, reaction.emoji)}>{reaction.emoji} {reaction.count}</button>)}{["❤️", "👏", "✨"].filter((emoji) => !comment.reactions?.some((reaction) => reaction.emoji === emoji)).map((emoji) => <button className="reaction" key={emoji} onClick={() => props.onReact(comment.id, emoji)}>{emoji}</button>)}{(comment.userId === props.currentUserId || props.isAuthor) && <button className="text-action" onClick={() => props.onDeleteComment(comment.id)}>Delete</button>}{comment.userId === props.currentUserId && <button className="text-action" onClick={() => { const next = window.prompt("Edit your note", comment.content); if (next?.trim()) props.onEditComment(comment.id, next.trim()); }}>Edit</button>}</div></div></article>)}{props.comments.length === 0 && <p className="muted">No notes yet. Start the conversation.</p>}</div>{story.commentsEnabled ? <form className="comment-form" onSubmit={props.onComment}><textarea rows={2} value={props.commentText} onChange={(event) => props.onCommentChange(event.target.value)} placeholder="Leave a thoughtful note…" maxLength={2000} required /><button className="primary-button" disabled={props.loading || !props.commentText.trim()}>Add note <span>→</span></button></form> : <p className="muted">The story author has turned comments off.</p>}</section>
  </div>;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal-card" role="dialog" aria-modal="true" aria-label={title}><div className="modal-heading"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close">×</button></div>{children}</section></div>;
}

function AuthScreen(props: {
  busy: boolean; error: string | null;
  onLogin: (email: string, password: string) => void;
  onRegister: (username: string, email: string, password: string) => void;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    if (mode === "login") props.onLogin(email, password);
    else props.onRegister(String(data.get("username") ?? ""), email, password);
  }
  return <main className="auth-screen"><div className="auth-illustration"><a className="brand" href="#"><span className="brand-mark">✳</span><span>Story<span className="brand-light">Weave</span></span></a><div className="auth-art"><div className="book-page left-page" /><div className="book-page right-page" /><div className="auth-spark spark-one">✧</div><div className="auth-spark spark-two">✦</div><div className="auth-quote">Every voice<br />adds a new <em>chapter.</em></div></div><div className="auth-caption">A shared canvas for stories still becoming.</div></div><div className="auth-panel"><div className="auth-form-wrap"><div className="eyebrow">{mode === "login" ? "WELCOME BACK, STORYTELLER" : "YOUR NEXT CHAPTER STARTS HERE"}</div><h1>{mode === "login" ? "Come on in." : "Find your people."}</h1><p className="subtitle">{mode === "login" ? "Your stories have been waiting." : "Create an account and start weaving."}</p><div className="auth-tabs"><button className={mode === "login" ? "selected" : ""} onClick={() => setMode("login")}>Sign in</button><button className={mode === "signup" ? "selected" : ""} onClick={() => setMode("signup")}>Create account</button></div>{props.error && <div className="alert error">{props.error}</div>}<form className="form-stack" onSubmit={submit}>{mode === "signup" && <label>Your name<input name="username" required minLength={2} maxLength={50} autoComplete="name" placeholder="How should we call you?" /></label>}<label>Email address<input name="email" type="email" required maxLength={100} autoComplete="email" placeholder="you@example.com" /></label><label>Password<input name="password" type="password" required minLength={mode === "signup" ? 10 : 1} maxLength={72} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder={mode === "signup" ? "At least 10 characters" : "Your password"} /></label><button className="primary-button auth-submit" disabled={props.busy}>{props.busy ? "One moment…" : mode === "login" ? "Sign in to your space" : "Create your account"} <span>→</span></button></form><p className="auth-terms">By continuing, you agree to keep this a kind and curious space.</p></div></div></main>;
}

export default App;
