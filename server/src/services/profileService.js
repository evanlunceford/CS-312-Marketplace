import * as profileRepository from "../repositories/profileRepository.js";
import { HttpError } from "../utils/httpError.js";

const USER_ID_PATTERN = /^[A-Za-z0-9_]{3,30}$/;
const MAX_NAME_LENGTH = 100;
const MAX_BIO_LENGTH = 1000;

// Retrieve a user's profile and listings
export async function getProfile(userId) {
  const action = "load profile";

  // Validate the user ID
  if (
    typeof userId !== "string" ||
    !USER_ID_PATTERN.test(userId)
  ) {
    throw new HttpError(400, action, "invalid user ID");
  }

  // Check that the user exists
  const profile = await profileRepository.findProfileByUserId(userId);

  if (!profile) {
    throw new HttpError(404, action, "user does not exist");
  }

  const listings = await profileRepository.findListingsByUserId(
    profile.userId
  );

  return {
    ...profile,
    listings
  };
}

// Update the authenticated user's profile
export async function updateProfile(userId, body) {
  const action = "update profile";

  // Check that the user exists
  const profile = await profileRepository.findProfileByUserId(userId);

  if (!profile) {
    throw new HttpError(404, action, "user does not exist");
  }

  // Validate the request body
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, action, "invalid request body");
  }

  if (body.name === undefined && body.bio === undefined) {
    throw new HttpError(400, action, "no profile changes provided");
  }

  const name = body.name === undefined ? profile.name : body.name;
  const bio = body.bio === undefined ? profile.bio : body.bio;

  // Validate the display name
  if (
    typeof name !== "string" ||
    name.trim().length < 1 ||
    name.trim().length > MAX_NAME_LENGTH
  ) {
    throw new HttpError(
      400,
      action,
      "name must be between 1 and 100 characters"
    );
  }

  // Validate the biography
  if (
    typeof bio !== "string" ||
    bio.length > MAX_BIO_LENGTH
  ) {
    throw new HttpError(
      400,
      action,
      "bio must not exceed 1000 characters"
    );
  }

  // Save the profile
  const updatedProfile = await profileRepository.updateProfile(
    profile.userId,
    {
      name: name.trim(),
      bio: bio.trim()
    }
  );

  // Verify that the profile was saved correctly
  if (
    !updatedProfile ||
    updatedProfile.userId !== profile.userId ||
    updatedProfile.name !== name.trim() ||
    updatedProfile.bio !== bio.trim()
  ) {
    throw new HttpError(500, action, "profile was not saved correctly");
  }

  const listings = await profileRepository.findListingsByUserId(
    updatedProfile.userId
  );

  return {
    ...updatedProfile,
    listings
  };
}