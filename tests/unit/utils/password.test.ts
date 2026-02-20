import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  validatePasswordPolicy,
} from "@/lib/utils/password";

describe("password utils", () => {
  describe("hashPassword", () => {
    it("TC-UT-016: パスワードをハッシュ化できる", async () => {
      const plain = "Abc12345";
      const hashed = await hashPassword(plain);
      expect(hashed).not.toBe(plain);
      expect(hashed).toMatch(/^\$2[ab]\$12\$/); // bcrypt コストファクター12
    });

    it("同じパスワードでも毎回異なるハッシュを生成する", async () => {
      const plain = "Abc12345";
      const hash1 = await hashPassword(plain);
      const hash2 = await hashPassword(plain);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyPassword", () => {
    it("TC-UT-016: 正しいパスワードで検証が通る", async () => {
      const plain = "Abc12345";
      const hashed = await hashPassword(plain);
      const result = await verifyPassword(plain, hashed);
      expect(result).toBe(true);
    });

    it("TC-UT-016: 誤ったパスワードで検証が失敗する", async () => {
      const plain = "Abc12345";
      const hashed = await hashPassword(plain);
      const result = await verifyPassword("WrongPass1", hashed);
      expect(result).toBe(false);
    });
  });

  describe("validatePasswordPolicy", () => {
    it("TC-UT-016: 有効なパスワード（8文字以上・英数字含む）は通過する", () => {
      expect(validatePasswordPolicy("Abc12345")).toBe(true);
      expect(validatePasswordPolicy("Password1")).toBe(true);
      expect(validatePasswordPolicy("abc12345678")).toBe(true);
    });

    it("TC-UT-017: 7文字（最小未満）はエラー", () => {
      expect(validatePasswordPolicy("Abc1234")).toBe(false);
    });

    it("TC-UT-018: 数字のみはエラー（英字必須）", () => {
      expect(validatePasswordPolicy("12345678")).toBe(false);
    });

    it("英字のみはエラー（数字必須）", () => {
      expect(validatePasswordPolicy("abcdefgh")).toBe(false);
    });

    it("空文字はエラー", () => {
      expect(validatePasswordPolicy("")).toBe(false);
    });
  });
});
