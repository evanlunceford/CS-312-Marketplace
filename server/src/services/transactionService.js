import * as transactionRepository from "../repositories/transactionRepository.js";
import { HttpError } from "../utils/httpError.js";

const USER_ID_PATTERN = /^[A-Za-z0-9_]{3,30}$/;
const MAX_ID = 2147483647;

// Validate a numeric database ID
function validateId(value, action, fieldName) {
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    !/^[0-9]+$/.test(String(value)) ||
    !Number.isSafeInteger(Number(value)) ||
    Number(value) < 1 ||
    Number(value) > MAX_ID
  ) {
    throw new HttpError(400, action, `invalid ${fieldName}`);
  }

  return Number(value);
}

// Record the sale of a listing
export async function createTransaction(sellerId, body) {
  const action = "record transaction";

  // Validate the request body
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, action, "invalid request body");
  }

  const listingId = validateId(
    body.listingId,
    action,
    "listing ID"
  );

  const buyerId = body.buyerId;

  // Validate the buyer ID
  if (
    typeof buyerId !== "string" ||
    !USER_ID_PATTERN.test(buyerId)
  ) {
    throw new HttpError(400, action, "invalid buyer ID");
  }

  try {
    return await transactionRepository.runInTransaction(
      async (client) => {
        // Find and lock the listing
        const listing =
          await transactionRepository.findListingForUpdate(
            client,
            listingId
          );

        if (!listing) {
          throw new HttpError(
            404,
            action,
            "listing does not exist"
          );
        }

        // Verify listing ownership
        if (listing.user_id !== sellerId) {
          throw new HttpError(
            403,
            action,
            "you do not own this listing"
          );
        }

        // Check whether the listing has already been sold
        const existingTransaction =
          await transactionRepository.findTransactionByListingId(
            client,
            listingId
          );

        if (existingTransaction || listing.status === "sold") {
          throw new HttpError(
            409,
            action,
            "listing has already been sold"
          );
        }

        // Verify that the listing is active
        if (listing.status !== "active") {
          throw new HttpError(
            409,
            action,
            "listing is not available for sale"
          );
        }

        // Check that the buyer exists
        const buyer =
          await transactionRepository.findUserById(
            client,
            buyerId
          );

        if (!buyer) {
          throw new HttpError(
            404,
            action,
            "buyer does not exist"
          );
        }

        // Prevent users from buying their own listings
        if (buyer.userId === sellerId) {
          throw new HttpError(
            400,
            action,
            "buyer and seller cannot be the same user"
          );
        }

        // Record the transaction using the listing price
        const transaction =
          await transactionRepository.insertTransaction(
            client,
            {
              listingId,
              buyerId: buyer.userId,
              sellerId,
              salePrice: listing.price
            }
          );

        // Verify that the transaction was created correctly
        if (
          !transaction ||
          transaction.listingId !== listingId ||
          transaction.buyerId !== buyer.userId ||
          transaction.sellerId !== sellerId ||
          transaction.salePrice !== listing.price
        ) {
          throw new HttpError(
            500,
            action,
            "transaction was not saved correctly"
          );
        }

        // Mark the listing as sold
        const updatedListing =
          await transactionRepository.markListingSold(
            client,
            listingId
          );

        // Verify the updated listing status
        if (
          !updatedListing ||
          updatedListing.id !== listingId ||
          updatedListing.status !== "sold"
        ) {
          throw new HttpError(
            500,
            action,
            "listing was not marked as sold"
          );
        }

        return transaction;
      }
    );
  } catch (error) {
    // Handle duplicate transaction constraint violations
    if (
      error.code === "23505" &&
      error.constraint === "transactions_listing_id_key"
    ) {
      throw new HttpError(
        409,
        action,
        "listing has already been sold"
      );
    }

    throw error;
  }
}

// Retrieve a user's purchase and sale history
export async function getUserTransactions(userId) {
  return await transactionRepository.findTransactionsByUserId(
    userId
  );
}

// Retrieve a specific transaction
export async function getTransaction(userId, transactionId) {
  const action = "load transaction";

  const id = validateId(
    transactionId,
    action,
    "transaction ID"
  );

  const transaction =
    await transactionRepository.findTransactionById(id);

  if (!transaction) {
    throw new HttpError(
      404,
      action,
      "transaction does not exist"
    );
  }

  // Restrict access to the buyer and seller
  if (
    transaction.buyerId !== userId &&
    transaction.sellerId !== userId
  ) {
    throw new HttpError(
      403,
      action,
      "you do not have access to this transaction"
    );
  }

  return transaction;
}