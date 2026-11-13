import { environment } from "../config/environment.js";
import * as authService from "../services/authService.js";
import { SESSION_COOKIE_NAME, readSessionToken } from "../middleware/authMiddleware.js";

function setSessionCookie(response, session) {
  response.cookie(SESSION_COOKIE_NAME, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: environment.isProduction,
    expires: session.expiresAt,
  });
}

export async function signUp(request, response) {
  const { user, session } = await authService.signUp(request.body);
  setSessionCookie(response, session);
  response.status(201).json({ user });
}

export async function signIn(request, response) {
  const { user, session } = await authService.signIn(request.body);
  setSessionCookie(response, session);
  response.json({ user });
}

export async function signOut(request, response) {
  await authService.signOut(readSessionToken(request));
  response.clearCookie(SESSION_COOKIE_NAME);
  response.status(204).end();
}

export function getCurrentUser(request, response) {
  response.json({ user: request.user });
}
