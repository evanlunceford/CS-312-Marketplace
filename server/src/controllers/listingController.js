const listingService = require('../services/listingService');

class ListingController {
  async getAll(req, res, next) {
    try {
      const listings = await listingService.getAllListings();
      res.json({ success: true, data: listings });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const listing = await listingService.getListingById(req.params.id);
      res.json({ success: true, data: listing });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const userId = req.user.id; 
      const newListing = await listingService.createListing(userId, req.body);
      res.status(201).json({ success: true, data: newListing });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const userId = req.user.id;
      const updated = await listingService.updateListing(userId, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      const userId = req.user.id;
      await listingService.deleteListing(userId, req.params.id);
      res.json({ success: true, message: 'Listing deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ListingController();
