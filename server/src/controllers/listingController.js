import * as listingService from "../services/listingService.js";

export async function getAll(request, response) {
  response.json({ success: true, data: await listingService.getAllListings() });
}
export async function getById(request, response) {
  response.json({ success: true, data: await listingService.getListingById(request.params.id) });
}
export async function create(request, response) {
  const listing = await listingService.createListing(request.user.userId, request.body);
  response.status(201).json({ success: true, data: listing });
}
export async function update(request, response) {
  const listing = await listingService.updateListing(request.user.userId, request.params.id, request.body);
  response.json({ success: true, data: listing });
}
export async function remove(request, response) {
  await listingService.deleteListing(request.user.userId, request.params.id);
  response.json({ success: true, message: "Listing deleted successfully" });
}
