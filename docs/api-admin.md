# Admin API Specification

Base URL: `/api/admin`

All endpoints require authentication (implementation-dependent; enforced at the middleware level).

---

## Common Types

### Tag object (short form)
```json
{ "id": "uuid", "name": "string", "slug": "string" }
```

### Error response
```json
{ "error": "string" }
```

HTTP status codes used: `400`, `401`, `404`, `409`, `500`

---

## Tags

### GET /api/admin/tags

Returns all tags as a flat list with category info.

**Query parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `format`  | `"group"` | — | When `format=group`, returns tags grouped by category (see below) |

**Response `200` (flat, default)**
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

**Response `200` (when `format=group`)**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "string",
      "slug": "string",
      "created_at": "ISO8601",
      "updated_at": "ISO8601",
      "tags": [{ "id": "uuid", "name": "string", "slug": "string" }]
    }
  ],
  "uncategorized": [
    { "id": "uuid", "name": "string", "slug": "string" }
  ]
}
```

---

### POST /api/admin/tags

Creates a new tag.

**Request body**
```json
{
  "name": "string",       // required
  "slug": "string",       // required, must be URL-safe
  "category_id": "uuid"   // optional, links tag to a category
}
```

**Response `201`**
```json
{ "id": "uuid" }
```

---

### PATCH /api/admin/tags/:id

Updates an existing tag.

**Path parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id`      | UUID | Tag ID |

**Request body**
```json
{
  "name": "string",            // required
  "slug": "string",            // required
  "category_id": "uuid | null" // optional: omit = no change, null = remove category, string = change category
}
```

**Notes**
- `name` and `slug` are always required even in a PATCH (full replacement of those fields)
- `category_id: undefined` (field omitted) → category_id is not changed
- `category_id: null` → removes the category association
- `category_id: "uuid"` → changes the category

**Response `200`**
```json
{ "success": true }
```

**Response `404`** — tag not found

---

### DELETE /api/admin/tags/:id

Deletes a tag. Also removes all project/post associations (CASCADE).

**Path parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id`      | UUID | Tag ID |

**Response `200`**
```json
{ "success": true }
```

---

## Tag Categories

### GET /api/admin/tags/categories

Returns all tag categories.

**Response `200`**
```json
[
  {
    "id": "uuid",
    "name": "string",
    "slug": "string",
    "created_at": "ISO8601",
    "updated_at": "ISO8601"
  }
]
```

---

### POST /api/admin/tags/categories

Creates a new tag category.

**Request body**
```json
{
  "name": "string",  // required
  "slug": "string"   // required
}
```

**Response `201`**
```json
{ "id": "uuid" }
```

---

### PATCH /api/admin/tags/categories/:id

Updates an existing category.

**Path parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id`      | UUID | Category ID |

**Request body**
```json
{
  "name": "string",  // required
  "slug": "string"   // required
}
```

**Response `200`**
```json
{ "success": true }
```

---

### DELETE /api/admin/tags/categories/:id

Deletes a category. Tags that belonged to this category will have their `category_id` set to `null` (they become uncategorized).

**Path parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id`      | UUID | Category ID |

**Response `200`**
```json
{ "success": true }
```

---

## Projects

### GET /api/admin/projects

Returns projects with optional filtering. Unlike the public endpoint, admin can filter by status and include deleted items.

**Query parameters**

| Parameter  | Type | Default | Description |
|------------|------|---------|-------------|
| `q`        | `string` | — | Search query (matches `title`, `description`, `keywords`) |
| `q_match`  | `"exact" \| "partial"` | `"partial"` | Match mode for `q` |
| `tag`      | `string` (repeatable) | — | Filter by tag slug |
| `tag_match`| `"exact" \| "partial"` | `"exact"` | `"exact"` = must have ALL tags, `"partial"` = must have ANY |
| `date_from`| `string` (ISO8601 date) | — | Filter `date >= date_from` |
| `date_to`  | `string` (ISO8601 date) | — | Filter `date <= date_to` |
| `status`   | `"published" \| "draft" \| "private" \| "archived"` | `"published"` | Filter by status |
| `deleted`  | `"true" \| "false" \| "all"` | `"false"` | `"true"` = deleted only, `"all"` = include deleted |

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
    "status": "published | draft | private | archived",
    "deleted_at": "ISO8601 | null",
    "delete_after": "ISO8601 | null",
    "created_at": "ISO8601",
    "updated_at": "ISO8601",
    "tags": [{ "id": "uuid", "name": "string", "slug": "string" }]
  }
]
```

---

### POST /api/admin/projects

Creates a new project.

**Request body**
```json
{
  "title": "string",           // required
  "slug": "string",            // required, must be unique
  "thumbnail": "string",       // optional
  "description": "string",     // optional
  "body": "string",            // optional (short text, not the full Markdown)
  "links": "string",           // optional (freeform links text)
  "keywords": "string",        // optional (comma-separated or freeform)
  "date": "ISO8601",           // optional, defaults to current timestamp
  "status": "published | draft | private | archived", // optional, defaults to "draft"
  "content": "string",         // optional, Markdown for README.md stored in R2
  "tagIds": ["uuid"],          // optional, array of tag IDs
  "initDocs": true,            // optional, if true creates an empty index.json (enables file tree)
  "siblings": {                // optional, creates/populates siblings section of index.json
    "other-project-slug": {
      "label": "string",
      "description": "string"  // optional
    }
  }
}
```

**Notes**
- Setting `initDocs: true` or providing `siblings` will create `index.json` in R2 and set `has_index = 1`
- If neither is set, the project has no file tree (`has_index = 0`)
- `content` is stored as R2 Markdown (`projects/{id}/README.md`); `body` is a separate short-text D1 field

**Response `201`**
```json
{ "id": "uuid" }
```

**Response `409`** — slug already exists

---

### GET /api/admin/projects/:slug

Returns a single project by slug, including soft-deleted projects. Includes README and file index.

**Path parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
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
  "status": "published | draft | private | archived",
  "deleted_at": "ISO8601 | null",
  "delete_after": "ISO8601 | null",
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
- `index` is `null` when `has_index = 0`
- `deleted_at` and `delete_after` will be set for soft-deleted projects

**Response `404`** — project not found

---

### PATCH /api/admin/projects/:slug

Updates a project. Only provided fields are updated.

**Path parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug`    | `string` | Current project slug |

**Request body** (all fields optional)
```json
{
  "title": "string",
  "slug": "string",            // if changed, must not conflict with existing slugs
  "thumbnail": "string | null",
  "description": "string | null",
  "body": "string | null",
  "links": "string | null",
  "keywords": "string | null",
  "date": "ISO8601",
  "status": "published | draft | private | archived",
  "content": "string",         // replaces README.md in R2
  "tagIds": ["uuid"],          // replaces all tags (omit to leave tags unchanged)
  "initDocs": true,            // creates index.json if not present, sets has_index=1
  "siblings": {                // replaces only the siblings section in index.json
    "other-project-slug": {
      "label": "string",
      "description": "string"
    }
  }
}
```

**Notes**
- `tagIds`: providing an empty array `[]` removes all tags; omitting the field leaves tags unchanged
- `siblings`: replaces the entire `siblings` section. The `files` and `folders` sections of `index.json` are preserved. Provide an empty object `{}` to clear all siblings.
- `initDocs: true`: idempotent — if `has_index` is already `1`, existing `index.json` content is preserved

**Response `200`**
```json
{ "success": true }
```

**Response `404`** — project not found
**Response `409`** — new slug already exists

---

### DELETE /api/admin/projects/:slug

Soft-deletes a project. Sets `deleted_at` to now and `delete_after` to 30 days from now. R2 files are not deleted immediately; a Cron Trigger handles physical deletion after the `delete_after` date.

**Path parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug`    | `string` | Project slug |

**Response `200`**
```json
{ "success": true }
```

**Response `404`** — project not found

---

### GET /api/admin/projects/:slug/:fileId

Returns a single file from a project's file tree.

**Path parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug`    | `string` | Project slug |
| `fileId`  | UUID | The `uuid` from `index.files` entry |

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

**Response `404`** — project not found, no file index, or fileId not in index

---

### POST /api/admin/projects/:slug

Adds a file or folder to a project's file tree. Only allowed when `has_index = 1`.

**Path parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug`    | `string` | Project slug |

**Request body**
```json
{
  "path": "string",       // required, virtual path (e.g. "/docs/intro")
  "type": "file | folder", // required
  "title": "string",      // required
  "description": "string", // optional
  "date": "ISO8601",      // optional
  "tags": ["string"],     // optional, tag labels (not IDs)
  "content": "string"     // optional, Markdown content (only used when type="file")
}
```

**Notes**
- `type: "file"`: generates a UUID, stores `content` in R2 at `projects/{id}/files/{uuid}`, and adds entry to `index.json` `files` section
- `type: "folder"`: adds entry to `index.json` `folders` section only. No R2 file is created.
- `content` is ignored for folders

**Response `201` (file)**
```json
{ "uuid": "uuid" }
```

**Response `201` (folder)**
```json
{}
```

**Response `400`** — project does not have a file index (`has_index = 0`)
**Response `404`** — project not found

---

### PATCH /api/admin/projects/:slug/:fileId

Updates a file's content and/or metadata. Only `file` entries can be updated (not folders). Only provided fields are updated.

**Path parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug`    | `string` | Project slug |
| `fileId`  | UUID | The `uuid` from `index.files` entry |

**Request body** (all fields optional)
```json
{
  "title": "string",
  "description": "string",
  "date": "ISO8601",
  "tags": ["string"],
  "content": "string"   // replaces the R2 file content
}
```

**Notes**
- `content` and metadata updates are performed in parallel
- Omitting a field leaves it unchanged

**Response `200`**
```json
{ "success": true }
```

**Response `404`** — project not found, no file index, or fileId not found in index

---

### DELETE /api/admin/projects/:slug/:fileId

Deletes a file from a project's file tree. Removes both the R2 file and its `index.json` entry.

**Path parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug`    | `string` | Project slug |
| `fileId`  | UUID | The `uuid` from `index.files` entry |

**Response `200`**
```json
{ "success": true }
```

**Response `404`** — project not found, no file index, or fileId not found in index

---

## Posts

### GET /api/admin/posts

Returns posts with optional filtering. Admin can filter by status and include deleted items.

**Query parameters**

| Parameter  | Type | Default | Description |
|------------|------|---------|-------------|
| `q`        | `string` | — | Search query (matches `title`, `description`, `keywords`) |
| `q_match`  | `"exact" \| "partial"` | `"partial"` | Match mode for `q` |
| `tag`      | `string` (repeatable) | — | Filter by tag slug |
| `tag_match`| `"exact" \| "partial"` | `"exact"` | `"exact"` = must have ALL tags, `"partial"` = must have ANY |
| `date_from`| `string` (ISO8601 date) | — | Filter `date >= date_from` |
| `date_to`  | `string` (ISO8601 date) | — | Filter `date <= date_to` |
| `status`   | `"published" \| "draft" \| "private" \| "archived"` | `"published"` | Filter by status |
| `deleted`  | `"true" \| "false" \| "all"` | `"false"` | `"true"` = deleted only, `"all"` = include deleted |

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
    "status": "published | draft | private | archived",
    "deleted_at": "ISO8601 | null",
    "delete_after": "ISO8601 | null",
    "created_at": "ISO8601",
    "updated_at": "ISO8601",
    "tags": [{ "id": "uuid", "name": "string", "slug": "string" }]
  }
]
```

---

### POST /api/admin/posts

Creates a new post.

**Request body**
```json
{
  "title": "string",           // required
  "slug": "string",            // required, must be unique
  "thumbnail": "string",       // optional
  "description": "string",     // optional
  "body": "string",            // optional (short text, not the full Markdown)
  "keywords": "string",        // optional
  "date": "ISO8601",           // optional, defaults to current timestamp
  "status": "published | draft | private | archived", // optional, defaults to "draft"
  "content": "string",         // optional, Markdown stored in R2 as posts/{id}/README.md
  "tagIds": ["uuid"]           // optional, array of tag IDs
}
```

**Response `201`**
```json
{ "id": "uuid" }
```

**Response `409`** — slug already exists

---

### GET /api/admin/posts/:slug

Returns a single post by slug, including soft-deleted posts and Markdown content.

**Path parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
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
  "status": "published | draft | private | archived",
  "deleted_at": "ISO8601 | null",
  "delete_after": "ISO8601 | null",
  "created_at": "ISO8601",
  "updated_at": "ISO8601",
  "tags": [{ "id": "uuid", "name": "string", "slug": "string" }],
  "readme": "string | null"
}
```

**Response `404`** — post not found

---

### PATCH /api/admin/posts/:slug

Updates a post. Only provided fields are updated.

**Path parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug`    | `string` | Current post slug |

**Request body** (all fields optional)
```json
{
  "title": "string",
  "slug": "string",            // if changed, must not conflict with existing slugs
  "thumbnail": "string | null",
  "description": "string | null",
  "body": "string | null",
  "keywords": "string | null",
  "date": "ISO8601",
  "status": "published | draft | private | archived",
  "content": "string",         // replaces README.md in R2
  "tagIds": ["uuid"]           // replaces all tags; omit to leave unchanged; [] to remove all
}
```

**Notes**
- `content` update and D1 field update are performed in parallel
- `tagIds: []` removes all tags; omitting `tagIds` leaves tags unchanged

**Response `200`**
```json
{ "success": true }
```

**Response `404`** — post not found
**Response `409`** — new slug already exists

---

### DELETE /api/admin/posts/:slug

Soft-deletes a post. Sets `deleted_at` to now and `delete_after` to 30 days from now. R2 files are not deleted immediately; a Cron Trigger handles physical deletion after the `delete_after` date.

**Path parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug`    | `string` | Post slug |

**Response `200`**
```json
{ "success": true }
```

**Response `404`** — post not found

---

## Lifecycle Notes

### Soft delete and physical deletion

When a resource is deleted via `DELETE`, it is only logically deleted:
- `deleted_at` is set to the current timestamp
- `delete_after` is set to 30 days later

A Cron Trigger scans for resources where `delete_after` has passed and performs physical deletion (both D1 rows and R2 files). Until that runs, a soft-deleted resource is still retrievable via admin endpoints.

### Status values

| Value | Meaning |
|-------|---------|
| `draft` | Work in progress, not visible publicly |
| `published` | Publicly visible |
| `private` | Not publicly visible (for personal reference) |
| `archived` | No longer active, hidden from public |

Only `published` resources appear in public API responses.
