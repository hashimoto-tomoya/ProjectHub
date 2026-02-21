import { prisma } from "@/lib/prisma/client";
import type { Prisma, User } from "@prisma/client";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: bigint): Promise<User | null>;
  create(data: Prisma.UserCreateInput): Promise<User>;
  update(id: bigint, data: Partial<Prisma.UserUpdateInput>): Promise<User>;
}

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  async findById(id: bigint): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async update(id: bigint, data: Partial<Prisma.UserUpdateInput>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}

export const userRepository = new PrismaUserRepository();
