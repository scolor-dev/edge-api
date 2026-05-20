# Public API Specification

Base URL: `/api`

All endpoints are read-only. No authentication required.

---

## Common Types

### Tag object
```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string"
}
```

### Error response
```json
{
  "error": "string"
}
```

HTTP status codes used: `400`, `404`, `500`

---

## Tags

### GET /api/tags

Returns all tags as a flat list, each with its category info.

**Query parameters:** none

**Response `200`**
```json
[
  {
    "id": "uuid",
    "category_id": "uuid | null",
    "name": "string",
    "slug": "string",
    "category_name": "string | null",
    "created_at": "ISO8601",
    "updated_at": "ISO8601"
  }
]
```

**Example**
```json
[
  {
    "id": "a1b2c3d4-...",
    "category_id": "e5f6g7h8-...",
    "name": "TypeScript",
    "slug": "typescript",
    "category_name": "Language",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "i9j0k1l2-...",
    "category_id": null,
    "name": "Misc",
    "slug": "misc",
    "category_name": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

---

## Projects

### GET /api/projects

Returns all published, non-deleted projects. Results are ordered by `date` descending.

**Query parameters**

| Parameter  | Type     | Default     | Description |
|------------|----------|-------------|-------------|
| `q`        | `string` | —           | Search query (matches `title`, `description`, `keywords`) |
| `q_match`  | `"exact" \| "partial"` | `"partial"` | Exact match or LIKE match for `q` |
| `tag`      | `string` (repeatable) | — | Filter by tag slug. Can repeat: `?tag=ts&tag=react` |
| `tag_match`| `"exact" \| "partial"` | `"exact"` | `"exact"` = must have ALL tags, `"partial"` = must have ANY tag |
| `date_from`| `string` (ISO8601 date) | — | Filter projects with `date >= date_from` |
| `date_to`  | `string` (ISO8601 date) | — | Filter projects with `date <= date_to` |

**Response `200`**
```json
[
  {
    "id": "uuid",
    "has_index": 0,
    "title": "string",
    "slug": "string",
    "thumbnail": "string | null",
    "description": "string | null",
    "body": "string | null",
    "links": "string | null",
    "keywords": "string | null",
    "date": "ISO8601 | null",
    "status": "published",
    "deleted_at": null,
    "delete_after": null,
    "created_at": "ISO8601",
    "updated_at": "ISO8601",
    "tags": [{ "id": "uuid", "name": "string", "slug": "string" }]
  }
]
```

**Notes**
- `has_index`: `1` means the project has an `index.json` (file tree) and individual files can be fetched via `GET /api/projects/:slug/:fileId`
- `body`: short freeform text field (not the full Markdown; reserved for excerpts, search index, etc.)
- `links`: freeform text field for external links (format is up to the client)
- Only `status = "published"` and non-deleted projects are returned

---

### GET /api/projects/:slug

Returns a single published project by slug, including its README content and optional file index.

**Path parameters**

| Parameter | Type     | Description |
|-----------|----------|-------------|
| `slug`    | `string` | Project slug |

**Response `200`**
```json
{
  "id": "uuid",
  "has_index": 0,
  "title": "string",
  "slug": "string",
  "thumbnail": "string | null",
  "description": "string | null",
  "body": "string | null",
  "links": "string | null",
  "keywords": "string | null",
  "date": "ISO8601 | null",
  "status": "published",
  "deleted_at": null,
  "delete_after": null,
  "created_at": "ISO8601",
  "updated_at": "ISO8601",
  "tags": [{ "id": "uuid", "name": "string", "slug": "string" }],
  "readme": "string | null",
  "index": {
    "files": {
      "/path/to/file": {
        "title": "string",
        "uuid": "uuid",
        "description": "string (optional)",
        "date": "ISO8601 (optional)",
        "tags": ["string"]
      }
    },
    "folders": {
      "/path/to/folder": {
        "title": "string",
        "description": "string (optional)",
        "date": "ISO8601 (optional)",
        "tags": ["string"]
      }
    },
    "siblings": {
      "other-project-slug": {
        "label": "string",
        "description": "string (optional)"
      }
    }
  }
}
```

**Notes**
- `readme`: full Markdown content of `README.md` stored in R2. `null` if not set.
- `index`: `null` when `has_index = 0`. When `has_index = 1`, contains the virtual file tree.
  - `files` keys are virtual paths (e.g. `/docs/intro`). Each file has a `uuid` used to fetch the content via `GET /api/projects/:slug/:fileId`.
  - `folders` keys are virtual paths. Folders have no associated R2 file; they are structural metadata only.
  - `siblings` keys are slugs of related projects (e.g. version chains). Use them to navigate to other projects.

**Response `404`** — project not found or is not published

---

### GET /api/projects/:slug/:fileId

Returns a single file within a project's file tree.

**Path parameters**

| Parameter | Type     | Description |
|-----------|----------|-------------|
| `slug`    | `string` | Project slug |
| `fileId`  | `string` (UUID) | The `uuid` value from the project's `index.files` entry |

**Response `200`**
```json
{
  "path": "/path/to/file",
  "meta": {
    "title": "string",
    "uuid": "uuid",
    "description": "string (optional)",
    "date": "ISO8601 (optional)",
    "tags": ["string"]
  },
  "content": "string | null"
}
```

**Notes**
- `path`: the virtual path key from `index.files` (e.g. `/docs/intro`)
- `content`: raw Markdown text stored in R2. `null` if the file has no content.
- Returns `404` if the project has `has_index = 0`, or if `fileId` is not found in `index.files`

**Response `404`** — project not found, project has no file index, or fileId does not exist

---

## Posts

### GET /api/posts

Returns all published, non-deleted posts. Results are ordered by `date` descending.

**Query parameters**

| Parameter  | Type     | Default     | Description |
|------------|----------|-------------|-------------|
| `q`        | `string` | —           | Search query (matches `title`, `description`, `keywords`) |
| `q_match`  | `"exact" \| "partial"` | `"partial"` | Exact match or LIKE match for `q` |
| `tag`      | `string` (repeatable) | — | Filter by tag slug. Can repeat: `?tag=ts&tag=react` |
| `tag_match`| `"exact" \| "partial"` | `"exact"` | `"exact"` = must have ALL tags, `"partial"` = must have ANY tag |
| `date_from`| `string` (ISO8601 date) | — | Filter posts with `date >= date_from` |
| `date_to`  | `string` (ISO8601 date) | — | Filter posts with `date <= date_to` |

**Response `200`**
```json
[
  {
    "id": "uuid",
    "has_index": 0,
    "title": "string",
    "slug": "string",
    "thumbnail": "string | null",
    "description": "string | null",
    "body": "string | null",
    "keywords": "string | null",
    "date": "ISO8601 | null",
    "status": "published",
    "deleted_at": null,
    "delete_after": null,
    "created_at": "ISO8601",
    "updated_at": "ISO8601",
    "tags": [{ "id": "uuid", "name": "string", "slug": "string" }]
  }
]
```

**Notes**
- Only `status = "published"` and non-deleted posts are returned
- `body`: short freeform text field (not the full Markdown; reserved for excerpts, search index, etc.)

---

### GET /api/posts/:slug

Returns a single published post by slug, including its Markdown content.

**Path parameters**

| Parameter | Type     | Description |
|-----------|----------|-------------|
| `slug`    | `string` | Post slug |

**Response `200`**
```json
{
  "id": "uuid",
  "has_index": 0,
  "title": "string",
  "slug": "string",
  "thumbnail": "string | null",
  "description": "string | null",
  "body": "string | null",
  "keywords": "string | null",
  "date": "ISO8601 | null",
  "status": "published",
  "deleted_at": null,
  "delete_after": null,
  "created_at": "ISO8601",
  "updated_at": "ISO8601",
  "tags": [{ "id": "uuid", "name": "string", "slug": "string" }],
  "readme": "string | null"
}
```

**Notes**
- `readme`: full Markdown content stored in R2 at `posts/{id}/README.md`. `null` if not set.

**Response `404`** — post not found or is not published
