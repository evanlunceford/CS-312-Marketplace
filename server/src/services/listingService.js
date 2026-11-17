import listingRepository from "../repositories/listingRepository.js";
import { HttpError } from "../utils/httpError.js";

function validateId(id, action) {
  if (!/^[1-9]\d*$/.test(String(id)) || Number(id) > 2147483647) {
    throw new HttpError(400, action, "listing ID must be a positive integer");
  }
}

function validateInput(data, action, partial = false) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new HttpError(400, action, "listing fields are required");
  }
  const values = {};
  for (const [field, maxLength] of [["title", 255], ["description", null], ["category", 100]]) {
    if (partial && data[field] === undefined) continue;
    if (typeof data[field] !== "string" || !data[field].trim() ||
        (maxLength !== null && data[field].trim().length > maxLength)) {
      throw new HttpError(400, action, field + " must be nonempty text" +
        (maxLength ? " of at most " + maxLength + " characters" : ""));
    }
    values[field] = data[field].trim();
  }
  if (!partial || data.price !== undefined) {
    const price = data.price;
    if (!["string", "number"].includes(typeof price) ||
        !/^\d+(?:\.\d{1,2})?$/.test(String(price)) ||
        !Number.isFinite(Number(price)) || Number(price) > 99999999.99) {
      throw new HttpError(400, action, "price must be between 0 and 99999999.99 with at most two decimal places");
    }
    values.price = price;
  }
  if (partial && data.status !== undefined) {
    if (typeof data.status !== "string" || !data.status.trim() || data.status.trim().length > 50) {
      throw new HttpError(400, action, "status must be nonempty text of at most 50 characters");
    }
    values.status = data.status.trim();
  }
  if (partial && Object.keys(values).length === 0) {
    throw new HttpError(400, action, "at least one listing field is required");
  }
  return values;
}

async function requireListing(id, action) {
  validateId(id, action);
  const listing = await listingRepository.findById(id);
  if (!listing) throw new HttpError(404, action, "listing " + id + " does not exist");
  return listing;
}
export async function getAllListings() {
  return listingRepository.findAll();
}
export async function getListingById(id) {
  return requireListing(id, "load listing");
}
export async function createListing(userId, data) {
  return listingRepository.create({ userId, ...validateInput(data, "create listing") });
}
export async function updateListing(userId, listingId, data) {
  const action = "update listing";
  const listing = await requireListing(listingId, action);
  if (listing.user_id !== userId) throw new HttpError(403, action, "you do not own this listing");
  const updated = await listingRepository.update(listingId, validateInput(data, action, true));
  if (!updated) throw new HttpError(404, action, "listing " + listingId + " no longer exists");
  return updated;
}
export async function deleteListing(userId, listingId) {
  const action = "delete listing";
  const listing = await requireListing(listingId, action);
  if (listing.user_id !== userId) throw new HttpError(403, action, "you do not own this listing");
  const removed = await listingRepository.delete(listingId);
  if (!removed) throw new HttpError(404, action, "listing " + listingId + " no longer exists");
  return removed;
}
