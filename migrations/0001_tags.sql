CREATE TABLE tag_categories (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE tags (
  id          TEXT PRIMARY KEY,
  category_id TEXT REFERENCES tag_categories(id),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE INDEX idx_tags_category ON tags(category_id);
CREATE INDEX idx_tags_slug ON tags(slug);