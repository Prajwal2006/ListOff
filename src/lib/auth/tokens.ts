import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

/** Unambiguous alphabet: no 0/O, 1/I/L. */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const GAME_CODE_LENGTH = 6;

export function generateGameCode(length = GAME_CODE_LENGTH): string {
  let out = "";
  for (let i = 0; i < length; i++) out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return out;
}

export function isValidGameCode(code: string): boolean {
  return new RegExp(`^[${CODE_ALPHABET}]{${GAME_CODE_LENGTH}}$`).test(code);
}

/** 256-bit random bearer token, URL-safe. Only its hash is stored. */
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Tokens are high-entropy random values, so an unsalted SHA-256 is a sound one-way store. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function safeEqualHex(a: string, b: string): boolean {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ab.length === bb.length && ab.length > 0 && timingSafeEqual(ab, bb);
}

export function isPlausibleToken(token: unknown): token is string {
  return typeof token === "string" && /^[A-Za-z0-9_-]{32,64}$/.test(token);
}
