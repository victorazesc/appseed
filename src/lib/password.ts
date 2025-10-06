import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(raw: string) {
  return bcrypt.hash(raw, SALT_ROUNDS);
}

export async function verifyPassword(raw: string, hash: string) {
  if (!hash) return false;
  try {
    return await bcrypt.compare(raw, hash);
  } catch (error) {
    console.error("verifyPassword", error);
    return false;
  }
}
