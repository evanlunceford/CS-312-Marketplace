import { httpClient } from "./httpClient.js";

export async function signUp({ userId, name, email, password }) {
  const response = await httpClient.post("/auth/signup", { userId, name, email, password });
  return response.data.user;
}

export async function signIn({ userId, password }) {
  const response = await httpClient.post("/auth/signin", { userId, password });
  return response.data.user;
}

export async function signOut() {
  await httpClient.post("/auth/signout");
}

// Resolves to the signed-in user, or null when there is no valid session.
export async function getCurrentUser() {
  try {
    const response = await httpClient.get("/auth/me");
    return response.data.user;
  } catch (error) {
    if (error.response?.status === 401) return null;
    throw error;
  }
}
