import bcrypt from "bcrypt";

const COST_FACTOR = 12;

/**
 * パスワードをbcryptでハッシュ化する（コストファクター12）
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST_FACTOR);
}

/**
 * 平文パスワードとハッシュを比較して一致するか検証する
 */
export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

/**
 * パスワードポリシーを検証する
 * - 8文字以上
 * - 英字を1文字以上含む
 * - 数字を1文字以上含む
 */
export function validatePasswordPolicy(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[a-zA-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}
