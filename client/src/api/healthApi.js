import { httpClient } from "./httpClient.js";

export async function getHealth() {
  const response = await httpClient.get("/health");
  return response.data;
}
