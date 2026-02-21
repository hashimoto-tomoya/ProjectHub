-- T06: パスワード履歴3世代管理のためのカラム追加
ALTER TABLE "users" ADD COLUMN "password_history" TEXT[] NOT NULL DEFAULT '{}';
