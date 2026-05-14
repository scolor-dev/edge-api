CREATE TABLE projects (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL DEFAULT 'simple',
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  links       TEXT,
  index_path  TEXT,
  keywords    TEXT,
  date        TEXT,
  status      TEXT NOT NULL DEFAULT 'draft',
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE TABLE project_tags (
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag_id     TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);

CREATE INDEX idx_projects_slug   ON projects(slug);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_type   ON projects(type);
CREATE INDEX idx_project_tags_project ON project_tags(project_id);
CREATE INDEX idx_project_tags_tag     ON project_tags(tag_id);