import * as commentService from "../services/commentService.js";

// Retrieve comments for a listing
export async function getComments(request, response) {
  const comments = await commentService.getComments(
    request.params.id
  );

  response.json({ comments });
}

// Post a new comment
export async function createComment(request, response) {
  const comment = await commentService.createComment(
    request.user.userId,
    request.params.id,
    request.body
  );

  response.status(201).json({ comment });
}