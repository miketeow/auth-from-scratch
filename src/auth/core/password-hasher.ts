import crypto from "crypto";
import { promisify } from "util";

//Promisify scrypt for cleaner async await syntax
const scryptAsync = promisify(crypto.scrypt);

export async function hashPassword(
  password: string,
  salt: string
): Promise<string> {
  const normalizePassword = password.normalize();
  // Use type assertion, directly tell TypeScript that it will return a buffer
  // if success based on the scrypt API documentation
  const derivedKey = (await scryptAsync(normalizePassword, salt, 64)) as Buffer;
  return derivedKey.toString("hex");
}

export function generateSalt() {
  return crypto.randomBytes(16).toString("hex");
}

export async function comparePasswords({
  password,
  salt,
  hashedPassword,
}: {
  password: string;
  salt: string;
  hashedPassword: string;
}) {
  const inputHashedPassword = await hashPassword(password, salt);

  return crypto.timingSafeEqual(
    Buffer.from(inputHashedPassword, "hex"),
    Buffer.from(hashedPassword, "hex")
  );
}
