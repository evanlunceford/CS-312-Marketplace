import * as commentRepository from "../repositories/commentRepository.js";
import { HttpError } from "../utils/httpError.js";

const MAX_COMMENT_LENGTH = 1000;
const MAX_ID = 2147483647;

// Validate a listing ID
function validateListingId(listingId, action) {
  if (
    !/^[0-9]+$/.test(String(listingId)) ||
    !Number.isSafeInteger(Number(listingId)) ||
    Number(listingId) < 1 ||
    Number(listingId) > MAX_ID
  ) {
    throw new HttpError(
      400,
      action,
      "invalid listing ID"
    );
  }

  return Number(listingId);
}

// Retrieve comments for a listing
export async function getComments(listingId) {
  const action = "load comments";

  const id = validateListingId(listingId, action);

  // Verify that the listing exists
  const exists = await commentRepository.listingExists(id);

  if (!exists) {
    throw new HttpError(
      404,
      action,
      "listing does not exist"
    );
  }

  return await commentRepository.findCommentsByListingId(id);
}

// Create a new comment
export async function createComment(
  userId,
  listingId,
  body
) {
  const action = "post comment";

  const id = validateListingId(listingId, action);

  // Validate the request body
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    throw new HttpError(
      400,
      action,
      "invalid request body"
    );
  }

  // Validate the comment content
  if (typeof body.content !== "string") {
    throw new HttpError(
      400,
      action,
      "comment content is required"
    );
  }

  const content = body.content.trim();

  if (content.length === 0) {
    throw new HttpError(
      400,
      action,
      "comment cannot be empty"
    );
  }

  if (content.length > MAX_COMMENT_LENGTH) {
    throw new HttpError(
      400,
      action,
      "comment cannot exceed 1000 characters"
    );
  }

  // Verify that the listing exists
  const exists = await commentRepository.listingExists(id);

  if (!exists) {
    throw new HttpError(
      404,
      action,
      "listing does not exist"
    );
  }

  let comment;

  try {
    // Save the comment
    comment = await commentRepository.insertComment(
      id,
      userId,
      content
    );
  } catch (error) {
    // Handle a deleted listing or user
    if (error.code === "23503") {
      throw new HttpError(
        409,
        action,
        "listing or user is no longer available"
      );
    }

    throw error;
  }

  // Verify that the comment was saved correctly
  if (
    !comment ||
    !comment.id ||
    comment.listingId !== id ||
    comment.userId !== userId ||
    comment.content !== content
  ) {
    throw new HttpError(
      500,
      action,
      "comment was not saved correctly"
    );
  }

  return comment;
}