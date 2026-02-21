import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "@/lib/services/auth.service";
import type { UserRepository } from "@/lib/repositories/user.repository";
import { hashPassword } from "@/lib/utils/password";
import { UnauthorizedError, ConflictError, NotFoundError } from "@/lib/utils/error";

// UserRepository のモック
const mockUserRepository: UserRepository = {
  findByEmail: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
};

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService(mockUserRepository);
  });

  describe("changePassword", () => {
    it("正常系: 正しい現在のパスワードで新しいパスワードに変更できる", async () => {
      const currentPlain = "OldPass1";
      const currentHash = await hashPassword(currentPlain);
      const mockUser = {
        id: BigInt(1),
        name: "テストユーザー",
        email: "test@test.local",
        passwordHash: currentHash,
        passwordHistory: [],
        role: "developer",
        isActive: true,
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockUserRepository.update).mockResolvedValue({
        ...mockUser,
        passwordHash: "newHash",
      });

      await expect(
        authService.changePassword(BigInt(1), currentPlain, "NewPass1")
      ).resolves.toBeUndefined();

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        BigInt(1),
        expect.objectContaining({
          mustChangePassword: false,
        })
      );
    });

    it("異常系: 現在のパスワードが誤っている場合は UnauthorizedError", async () => {
      const currentHash = await hashPassword("CorrectPass1");
      const mockUser = {
        id: BigInt(1),
        name: "テストユーザー",
        email: "test@test.local",
        passwordHash: currentHash,
        passwordHistory: [],
        role: "developer",
        isActive: true,
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);

      await expect(authService.changePassword(BigInt(1), "WrongPass1", "NewPass1")).rejects.toThrow(
        UnauthorizedError
      );
    });

    it("異常系: 現在のパスワードと同じ新パスワードは CONFLICT エラー", async () => {
      const currentPlain = "CurrentPass1";
      const currentHash = await hashPassword(currentPlain);
      const mockUser = {
        id: BigInt(1),
        name: "テストユーザー",
        email: "test@test.local",
        passwordHash: currentHash,
        passwordHistory: [],
        role: "developer",
        isActive: true,
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);

      // 現在のパスワードと同じ新パスワードは履歴チェックで弾かれる
      await expect(
        authService.changePassword(BigInt(1), currentPlain, currentPlain)
      ).rejects.toThrow(ConflictError);
    });

    it("異常系: パスワード履歴3世代内のパスワードは CONFLICT エラー", async () => {
      const oldPass1 = "OldPass001";
      const oldPass2 = "OldPass002";
      const oldPass3 = "OldPass003";
      const currentPlain = "CurrentP4";

      const hash1 = await hashPassword(oldPass1);
      const hash2 = await hashPassword(oldPass2);
      const hash3 = await hashPassword(oldPass3);
      const currentHash = await hashPassword(currentPlain);

      const mockUser = {
        id: BigInt(1),
        name: "テストユーザー",
        email: "test@test.local",
        passwordHash: currentHash,
        passwordHistory: [hash1, hash2, hash3], // 直近3世代の履歴
        role: "developer",
        isActive: true,
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);

      // 履歴にある oldPass1 を新パスワードとして使おうとする
      await expect(authService.changePassword(BigInt(1), currentPlain, oldPass1)).rejects.toThrow(
        ConflictError
      );
    });

    it("パスワード変更後に mustChangePassword フラグが false にリセットされる", async () => {
      const currentPlain = "InitPass1";
      const currentHash = await hashPassword(currentPlain);
      const mockUser = {
        id: BigInt(1),
        name: "テストユーザー",
        email: "test@test.local",
        passwordHash: currentHash,
        passwordHistory: [],
        role: "developer",
        isActive: true,
        mustChangePassword: true, // 初回ログイン時は true
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockUserRepository.update).mockResolvedValue({
        ...mockUser,
        mustChangePassword: false,
      });

      await authService.changePassword(BigInt(1), currentPlain, "NewPass12");

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        BigInt(1),
        expect.objectContaining({
          mustChangePassword: false,
        })
      );
    });

    it("パスワード変更後にパスワード履歴が更新される（最大3世代）", async () => {
      const currentPlain = "CurrentP4";
      const oldHash1 = await hashPassword("OldPass001");
      const oldHash2 = await hashPassword("OldPass002");
      const currentHash = await hashPassword(currentPlain);

      const mockUser = {
        id: BigInt(1),
        name: "テストユーザー",
        email: "test@test.local",
        passwordHash: currentHash,
        passwordHistory: [oldHash1, oldHash2],
        role: "developer",
        isActive: true,
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockUserRepository.update).mockResolvedValue({ ...mockUser });

      await authService.changePassword(BigInt(1), currentPlain, "NewPass12");

      const updateCall = vi.mocked(mockUserRepository.update).mock.calls[0];
      const updateData = updateCall[1];

      // 新しい履歴は [currentHash, oldHash1, oldHash2] となり3世代を保持
      expect(Array.isArray(updateData.passwordHistory)).toBe(true);
      const history = updateData.passwordHistory as string[];
      expect(history).toHaveLength(3);
      // 一番古い oldHash2 が先頭ではなく、currentHash が先頭に来る
      expect(history[0]).toBe(currentHash);
    });

    it("異常系: ユーザーが見つからない場合は NotFoundError", async () => {
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      await expect(authService.changePassword(BigInt(999), "OldPass1", "NewPass1")).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("validateFirstLogin", () => {
    it("mustChangePassword が true のユーザーは true を返す", async () => {
      const mockUser = {
        id: BigInt(1),
        name: "テストユーザー",
        email: "test@test.local",
        passwordHash: "hash",
        passwordHistory: [],
        role: "developer",
        isActive: true,
        mustChangePassword: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);

      const result = await authService.validateFirstLogin(BigInt(1));
      expect(result).toBe(true);
    });

    it("mustChangePassword が false のユーザーは false を返す", async () => {
      const mockUser = {
        id: BigInt(1),
        name: "テストユーザー",
        email: "test@test.local",
        passwordHash: "hash",
        passwordHistory: [],
        role: "developer",
        isActive: true,
        mustChangePassword: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);

      const result = await authService.validateFirstLogin(BigInt(1));
      expect(result).toBe(false);
    });

    it("ユーザーが見つからない場合は NotFoundError", async () => {
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      await expect(authService.validateFirstLogin(BigInt(999))).rejects.toThrow(NotFoundError);
    });
  });
});
