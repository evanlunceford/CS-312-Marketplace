import * as transactionService from "../services/transactionService.js";

// Record a new transaction
export async function createTransaction(request, response) {
  const transaction =
    await transactionService.createTransaction(
      request.user.userId,
      request.body
    );

  response.status(201).json({ transaction });
}

// Retrieve the signed-in user's transactions
export async function getOwnTransactions(request, response) {
  const transactions =
    await transactionService.getUserTransactions(
      request.user.userId
    );

  response.json({ transactions });
}

// Retrieve a specific transaction
export async function getTransaction(request, response) {
  const transaction =
    await transactionService.getTransaction(
      request.user.userId,
      request.params.id
    );

  response.json({ transaction });
}