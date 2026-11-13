import { createHash, randomBytes } from "crypto";
import { environment } from "../config/environment.js";
import { HttpError } from "../utils/httpError.js";
import { hashPassword, verifyPassword } from "../utils/passwordHasher.js";
import * as userRepository from "../repositories/userRepository.js";
import * as sessionRepository from "../repositories/sessionRepository.js";

const USER_ID_PATTERN = /^[A-Za-z0-9_]{3,30}$/;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

// Verified against when a user ID does not exist, so response time does not reveal which IDs exist.
const unknownUserHash = await hashPassword("unknown-user-placeholder");

export function hashSessionToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function requireString(value, fieldLabel, action) {
  if (typeof value !== "string") throw new HttpError(400, action, `${fieldLabel} is required`);
  return value;
}

function validateSignupInput(body) {
  const action = "sign up";
  const userId = requireString(body.userId, "user ID", action).trim();
  const name = requireString(body.name, "name", action).trim();
  const email = requireString(body.email, "email", action).trim();
  const password = requireString(body.password, "password", action);

  if (!USER_ID_PATTERN.test(userId)) {
    throw new HttpError(400, action, "user ID must be 3-30 characters: letters, numbers and underscores only");
  }
  if (name.length < 1 || name.length > 100) throw new HttpError(400, action, "name must be 1-100 characters");
  if (!EMAIL_PATTERN.test(email)) throw new HttpError(400, action, "email is not a valid email address");
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    throw new HttpError(400, action, `password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} characters`);
  }
  return { userId, name, email, password };
}

async function startSession(userId) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + environment.sessionDurationInDays * 24 * 60 * 60 * 1000);
  await sessionRepository.insertSession({ tokenHash: hashSessionToken(token), userId, expiresAt });
  return { token, expiresAt };
}

export async function signUp(body) {
  const { userId, name, email, password } = validateSignupInput(body ?? {});

  if (await userRepository.findUserById(userId)) {
    throw new HttpError(409, "sign up", `user ID "${userId}" is already taken`);
  }
  if (await userRepository.findUserByEmail(email)) {
    throw new HttpError(409, "sign up", "an account with that email already exists");
  }

  let user;
  try {
    user = await userRepository.insertUser({ userId, name, email, passwordHash: await hashPassword(password) });
  } catch (error) {
    // Two signups racing past the checks above are still stopped by the database's unique indexes.
    if (error.code === "23505") throw new HttpError(409, "sign up", "that user ID or email is already in use");
    throw error;
  }

  // Post-condition: the account was stored and the result never exposes the password hash.
  if (!user || user.userId !== userId || "passwordHash" in user) {
    throw new HttpError(500, "sign up", "account was not saved correctly");
  }
  return { user, session: await startSession(user.userId) };
}

export async function signIn(body) {
  const action = "sign in";
  const userId = requireString(body?.userId, "user ID", action).trim();
  const password = requireString(body?.password, "password", action);
  if (userId === "" || password === "") throw new HttpError(400, action, "user ID and password are required");

  const userWithHash = await userRepository.findUserWithPasswordHash(userId);
  const passwordMatches = await verifyPassword(password, userWithHash?.passwordHash ?? unknownUserHash);
  if (!userWithHash || !passwordMatches) throw new HttpError(401, action, "invalid user ID or password");

  const { passwordHash, ...user } = userWithHash;
  const session = await startSession(user.userId);

  // Post-condition: the session we hand out resolves back to this user.
  const sessionOwner = await sessionRepository.findUserBySessionTokenHash(hashSessionToken(session.token));
  if (sessionOwner?.userId !== user.userId) throw new HttpError(500, action, "session was not created correctly");
  return { user, session };
}

export async function signOut(token) {
  if (!token) return;
  await sessionRepository.deleteSession(hashSessionToken(token));
}

// Returns the signed-in user for a session token, or throws 401.
export async function getUserForSession(token) {
  const user = token ? await sessionRepository.findUserBySessionTokenHash(hashSessionToken(token)) : null;
  if (!user) throw new HttpError(401, "authenticate", "you must be signed in");
  return user;
}
