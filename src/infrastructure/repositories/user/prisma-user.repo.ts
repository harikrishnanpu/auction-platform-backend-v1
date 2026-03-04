import { User } from '@domain/entities/user/user.entity';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Email } from '@domain/value-objects/email.vo';
import { PrismaClient } from '@prisma/client';
import { UserMapper } from '../../mappers/user/user.mapper';
import { Phone } from '@domain/value-objects/phone.vo';
import { inject, injectable } from 'inversify';
import { AUTH_TYPES } from 'di/types/auth/auth.types';

@injectable()
export class PrismaUserRepo implements IUserRepository {
  constructor(
    @inject(AUTH_TYPES.PrismaClient)
    private readonly prisma: PrismaClient,
  ) {}

  async findById(userId: string): Promise<User | null> {
    const dbUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        roles: true,
      },
    });

    if (!dbUser) return null;

    const userResult = UserMapper.toDomain(dbUser);
    if (userResult.isFailure) return null;

    return userResult.getValue();
  }

  async findByEmail(email: Email): Promise<User | null> {
    const dbUser = await this.prisma.user.findUnique({
      where: {
        email: email.getValue(),
      },
      include: {
        roles: true,
      },
    });

    if (!dbUser) return null;

    const userResult = UserMapper.toDomain(dbUser);
    if (userResult.isFailure) return null;

    return userResult.getValue();
  }

  async findByPhone(phone: Phone): Promise<User | null> {
    const dbUser = await this.prisma.user.findUnique({
      where: {
        phone: phone.getValue(),
      },
      include: {
        roles: true,
      },
    });

    if (!dbUser) return null;

    const userResult = UserMapper.toDomain(dbUser);
    if (userResult.isFailure) return null;

    return userResult.getValue();
  }

  async save(user: User): Promise<void> {
    const persistantUser = UserMapper.toPersistence(user);

    await this.prisma.user.upsert({
      where: {
        id: user.getId(),
      },
      update: {
        ...persistantUser,
        roles: {
          deleteMany: {},
          create: user.getRoles().map((r) => ({ role: r.getValue() })),
        },
      },
      create: {
        ...persistantUser,
        roles: {
          create: user.getRoles().map((r) => ({ role: r.getValue() })),
        },
      },
    });
  }
}
