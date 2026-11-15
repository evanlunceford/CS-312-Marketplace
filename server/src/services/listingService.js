const listingRepository = require('../repositories/listingRepository');
const HttpError = require('../utils/httpError');

class ListingService {
  async getAllListings() {
    return await listingRepository.findAll();
  }

  async getListingById(id) {
    const listing = await listingRepository.findById(id);
    if (!listing) {
      throw new HttpError(404, 'Listing not found');
    }
    return listing;
  }

  async createListing(userId, data) {
    const { title, description, price, category } = data;
    if (!title || !description || price === undefined || !category) {
      throw new HttpError(400, 'All fields (title, description, price, category) are required');
    }
    return await listingRepository.create({ userId, title, description, price, category });
  }

  async updateListing(userId, listingId, data) {
    const listing = await listingRepository.findById(listingId);
    if (!listing) {
      throw new HttpError(404, 'Listing not found');
    }
    if (listing.user_id !== userId) {
      throw new HttpError(403, 'Unauthorized to update this listing');
    }
    return await listingRepository.update(listingId, data);
  }

  async deleteListing(userId, listingId) {
    const listing = await listingRepository.findById(listingId);
    if (!listing) {
      throw new HttpError(404, 'Listing not found');
    }
    if (listing.user_id !== userId) {
      throw new HttpError(403, 'Unauthorized to delete this listing');
    }
    return await listingRepository.delete(listingId);
  }
}

module.exports = new ListingService();
