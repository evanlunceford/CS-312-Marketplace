import axios from "axios";

// Shared axios instance. Feature API modules (listingApi.js, commentApi.js, ...) import this.
export const httpClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// Pulls the server's "Failed to <action>: <reason>" message out of an axios error.
export function getErrorMessage(error) {
  return error.response?.data?.error ?? `Failed to reach server: ${error.message}`;
}
