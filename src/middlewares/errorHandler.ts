import type { Context } from "hono"

import { AppError } from "../lib/errors"

export const errorHandler = (err: Error, c: Context) => {
	if (err instanceof AppError) {
		if (err.cause) {
			console.error(err.cause)
		}

		return c.json(
			{
				message: err.message,
			},
			err.status,
		)
	}

	console.error(err)

	return c.json(
		{
			message: "Internal Server Error",
		},
		500,
	)
}
