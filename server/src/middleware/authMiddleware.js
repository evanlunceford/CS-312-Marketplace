import * as authService from "../services/authService.js";

export const SESSION_COOKIE_NAME = "session_token";

export function readSessionToken(request) {
  for (const cookiePair of (request.headers.cookie ?? "").split(";")) {
    const separatorIndex = cookiePair.indexOf("=");
    if (separatorIndex !== -1 && cookiePair.slice(0, separatorIndex).trim() === SESSION_COOKIE_NAME) {
      return decodeURIComponent(cookiePair.slice(separatorIndex + 1).trim());
    }
  }
  return null;
}

// USE ON ANY ROUTE THAT NEEDS AUTHENTICATION: router.post("/", requireAuth, controller).
// Sets request.user = { userId, name, email, createdAt }.
export async function requireAuth(request, response, next) {
  request.user = await authService.getUserForSession(readSessionToken(request));
  next();
}
