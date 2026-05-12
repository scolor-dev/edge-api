import type { ContentfulStatusCode } from 'hono/utils/http-status'

export class AppError extends Error {
  constructor(
    message: string,
    public status: ContentfulStatusCode = 500,
    public cause?: unknown
  ) {
    super(message)

    this.name = 'AppError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401)

    this.name = 'UnauthorizedError'
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(message, 404)

    this.name = 'NotFoundError'
  }
}