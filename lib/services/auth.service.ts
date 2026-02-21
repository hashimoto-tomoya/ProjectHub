import { hashPassword, verifyPassword } from "@/lib/utils/password";
import { UnauthorizedError, ConflictError, NotFoundError } from "@/lib/utils/error";
import { userRepository } from "@/lib/repositories/user.repository";
import type { UserRepository } from "@/lib/repositories/user.repository";

const PASSWORD_HISTORY_MAX = 3;

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  /**
   * パスワードを変更する
   * - 現在のパスワードを検証する
   * - 過去3世代のパスワード履歴と照合してリセットを防ぐ
   * - 新しいパスワードでハッシュを更新し、履歴をローテートする
   * - mustChangePassword フラグをリセットする
   */
  async changePassword(
    userId: bigint,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("ユーザーが見つかりません");
    }

    // 現在のパスワードを検証
    const isCurrentValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw new UnauthorizedError("現在のパスワードが正しくありません");
    }

    // 現在のパスワードと新パスワードが同じでないか確認
    const isSameAsCurrent = await verifyPassword(newPassword, user.passwordHash);
    if (isSameAsCurrent) {
      throw new ConflictError("現在のパスワードと同じパスワードは使用できません");
    }

    // パスワード履歴3世代と照合
    const history: string[] = user.passwordHistory ?? [];
    for (const oldHash of history) {
      const isSameAsOld = await verifyPassword(newPassword, oldHash);
      if (isSameAsOld) {
        throw new ConflictError("過去3回分のパスワードは使用できません");
      }
    }

    // 新しいパスワードをハッシュ化
    const newHash = await hashPassword(newPassword);

    // 履歴を更新（現在のハッシュを先頭に追加し、最大3件を保持）
    const newHistory = [user.passwordHash, ...history].slice(0, PASSWORD_HISTORY_MAX);

    await this.userRepository.update(userId, {
      passwordHash: newHash,
      passwordHistory: newHistory,
      mustChangePassword: false,
    });
  }

  /**
   * 初回ログイン確認
   * - mustChangePassword フラグを返す
   */
  async validateFirstLogin(userId: bigint): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("ユーザーが見つかりません");
    }
    return user.mustChangePassword;
  }
}

export const authService = new AuthService(userRepository);
