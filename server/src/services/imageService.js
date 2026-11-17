import path from "path";
import { randomUUID } from "crypto";
import { mkdir, writeFile, unlink } from "fs/promises";
import { fileTypeFromBuffer } from "file-type";

import * as imageRepository from "../repositories/imageRepository.js";
import { HttpError } from "../utils/httpError.js";

import {
  uploadDirectory,
  uploadUrl,
  MAX_IMAGE_SIZE,
  ALLOWED_IMAGE_TYPES
} from "../config/uploadConfig.js";

// Remove an uploaded image
async function removeImage(imagePath) {
  if (typeof imagePath !== "string") {
    return;
  }

  const pattern =
    /^\/api\/uploads\/[a-f0-9-]{36}\.(jpg|png|webp)$/;

  if (!pattern.test(imagePath)) {
    return;
  }

  const filename = path.basename(imagePath);
  const filePath = path.join(uploadDirectory, filename);

  try {
    await unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Failed to remove image:", error);
    }
  }
}

// Upload or replace a listing image
export async function uploadImage(userId, listingId, file) {
  const action = "upload image";

  // Validate the listing ID
  if (
    !/^[0-9]+$/.test(String(listingId)) ||
    !Number.isSafeInteger(Number(listingId)) ||
    Number(listingId) < 1 ||
    Number(listingId) > 2147483647
  ) {
    throw new HttpError(400, action, "invalid listing ID");
  }

  const id = Number(listingId);

  // Check that an image was provided
  if (!file || !file.buffer || file.size === 0) {
    throw new HttpError(400, action, "image is required");
  }

  // Validate the file size
  if (file.size > MAX_IMAGE_SIZE) {
    throw new HttpError(
      413,
      action,
      "image cannot exceed 5 MB"
    );
  }

  // Detect the actual file type
  let detectedType;

  try {
    detectedType = await fileTypeFromBuffer(file.buffer);
  } catch {
    throw new HttpError(400, action, "invalid image file");
  }

  // Validate the actual file type
  if (
    !detectedType ||
    !ALLOWED_IMAGE_TYPES.has(detectedType.mime) ||
    detectedType.mime !== file.mimetype
  ) {
    throw new HttpError(
      400,
      action,
      "invalid or unsupported image format"
    );
  }

  // Generate a unique filename
  const filename = `${randomUUID()}.${detectedType.ext}`;
  const filePath = path.join(uploadDirectory, filename);
  const imagePath = `${uploadUrl}/${filename}`;

  let previousImage = null;
  let fileCreated = false;
  let updatedListing;

  try {
    updatedListing = await imageRepository.runInTransaction(
      async (client) => {
        // Retrieve and lock the listing
        const listing =
          await imageRepository.findListingForUpdate(
            client,
            id
          );

        if (!listing) {
          throw new HttpError(
            404,
            action,
            "listing does not exist"
          );
        }

        // Verify listing ownership
        if (listing.user_id !== userId) {
          throw new HttpError(
            403,
            action,
            "you do not own this listing"
          );
        }

        // Check whether the listing has been sold
        const sold = await imageRepository.hasTransaction(
          client,
          id
        );

        if (listing.status !== "active" || sold) {
          throw new HttpError(
            409,
            action,
            "listing is not active"
          );
        }

        previousImage = listing.image_path;

        // Create the upload directory
        await mkdir(uploadDirectory, { recursive: true });

        // Save the image to disk
        await writeFile(filePath, file.buffer, {
          flag: "wx"
        });

        fileCreated = true;

        // Save the image path in the database
        const updated =
          await imageRepository.updateListingImage(
            client,
            id,
            userId,
            imagePath
          );

        // Verify that the image path was saved
        if (
          !updated ||
          updated.id !== id ||
          updated.user_id !== userId ||
          updated.image_path !== imagePath
        ) {
          throw new HttpError(
            500,
            action,
            "image path was not saved correctly"
          );
        }

        return updated;
      }
    );
  } catch (error) {
    // Remove the new image if the operation fails
    if (fileCreated) {
      await removeImage(imagePath);
    }

    throw error;
  }

  // Remove the previous image after a successful update
  if (previousImage) {
    await removeImage(previousImage);
  }

  return updatedListing;
}