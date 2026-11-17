import { httpClient } from "./httpClient.js";

// Record a new transaction
export async function createTransaction(details) {
  const response = await httpClient.post(
    "/transactions",
    details
  );

  return response.data.transaction;
}

// Retrieve the signed-in user's transactions
export async function getOwnTransactions() {
  const response = await httpClient.get(
    "/transactions/me"
  );

  return response.data.transactions;
}

// Retrieve a specific transaction
export async function getTransaction(transactionId) {
  const response = await httpClient.get(
    `/transactions/${transactionId}`
  );

  return response.data.transaction;
}