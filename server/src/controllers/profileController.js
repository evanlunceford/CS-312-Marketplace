import * as profileService from "../services/profileService.js";

// Retrieve a profile by user ID
export async function getProfile(request, response) {
  const profile = await profileService.getProfile(
    request.params.userId
  );

  response.json({ profile });
}

// Retrieve the signed-in user's profile
export async function getOwnProfile(request, response) {
  const profile = await profileService.getProfile(
    request.user.userId
  );

  response.json({ profile });
}

// Update the signed-in user's profile
export async function updateOwnProfile(request, response) {
  const profile = await profileService.updateProfile(
    request.user.userId,
    request.body
  );

  response.json({ profile });
}