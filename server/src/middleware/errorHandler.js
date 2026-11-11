import { HttpError } from "../utils/httpError.js";

export function handleNotFound(request, response, next) {
  next(new HttpError(404, "find endpoint", `${request.method} ${request.originalUrl} does not exist`));
}

// Every error response has the same shape: { "error": "Failed to <action>: <reason>" }
// Express 5 forwards errors thrown in async handlers here automatically.
// eslint-disable-next-line no-unused-vars
export function handleError(error, request, response, next) {
  if (error instanceof HttpError) {
    return response.status(error.statusCode).json({ error: error.message });
  }
  if (error.type === "entity.parse.failed") {
    return response.status(400).json({ error: "Failed to read request: body is not valid JSON" });
  }
  console.error(error);
  return response.status(500).json({ error: "Failed to process request: unexpected server error" });
}
