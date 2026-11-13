import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const deriveKey = promisify(scrypt);
const KEY_LENGTH_IN_BYTES = 64;

// Stored format: "<salt hex>:<key hex>". A fresh random salt per password.
export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt, KEY_LENGTH_IN_BYTES);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifyPassword(password, storedHash) {
  const [saltHex, keyHex] = storedHash.split(":");
  const expectedKey = Buffer.from(keyHex, "hex");
  const actualKey = await deriveKey(password, Buffer.from(saltHex, "hex"), expectedKey.length);
  return timingSafeEqual(actualKey, expectedKey);
}
