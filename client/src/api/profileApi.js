import { httpClient } from "./httpClient.js";

// Retrieve the signed-in user's profile
export async function getOwnProfile() {
  const response = await httpClient.get("/profiles/me");

  return response.data.profile;
}

// Retrieve another user's profile
export async function getProfile(userId) {
  const response = await httpClient.get(
    `/profiles/${encodeURIComponent(userId)}`
  );

  return response.data.profile;
}

// Update the signed-in user's profile
export async function updateProfile(details) {
  const response = await httpClient.patch(
    "/profiles/me",
    details
  );

  return response.data.profile;
}