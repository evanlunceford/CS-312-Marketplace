import * as imageService from "../services/imageService.js";

// Upload a listing image
export async function uploadImage(request, response) {
  const listing = await imageService.uploadImage(
    request.user.userId,
    request.params.id,
    request.file
  );

  response.status(200).json({ listing });
}