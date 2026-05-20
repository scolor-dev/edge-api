CREATE TABLE posts (
  id           TEXT PRIMARY KEY,
  has_index    INTEGER NOT NULL DEFAULT 0,
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  thumbnail    TEXT,
  description  TEXT,
  body         TEXT,
  keywords     TEXT,
  date         TEXT,
  status       TEXT NOT NULL DEFAULT 'draft',
  deleted_at   TEXT,
  delete_after TEXT,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);

CREATE TABLE post_tags (
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX idx_posts_slug       ON posts(slug);
CREATE INDEX idx_posts_status     ON posts(status);
CREATE INDEX idx_posts_deleted_at ON posts(deleted_at);
CREATE INDEX idx_post_tags_post   ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag    ON post_tags(tag_id);