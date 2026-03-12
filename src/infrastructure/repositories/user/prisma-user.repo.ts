import { User } from '@domain/entities/user/user.entity';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Email } from '@domain/value-objects/email.vo';
import { PrismaClient } from '@prisma/client';
import { UserMapper } from '../../mappers/user/user.mapper';
import { Phone } from '@domain/value-objects/phone.vo';
import { inject, injectable } from 'inversify';
import { TYPES } from 'di/types.di';
import { Result } from '@domain/shared/result';

@injectable()
export class PrismaUserRepo implements IUserRepository {
  constructor(
    @inject(TYPES.PrismaClient)
    private readonly _prisma: PrismaClient,
  ) {}

  async findById(userId: string): Promise<Result<User>> {
    const dbUser = await this._prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        roles: true,
      },
    });

    if (!dbUser) return Result.fail('User not found');

    const userResult = UserMapper.toDomain(dbUser);
    if (userResult.isFailure) return Result.fail(userResult.getError());

    return Result.ok(userResult.getValue());
  }

  async findByEmail(email: Email): Promise<Result<User>> {
    const dbUser = await this._prisma.user.findUnique({
      where: {
        email: email.getValue(),
      },
      include: {
        roles: true,
      },
    });

    if (!dbUser) return Result.fail('User not found');

    const userResult = UserMapper.toDomain(dbUser);
    if (userResult.isFailure) return Result.fail(userResult.getError());

    return Result.ok(userResult.getValue());
  }

  async findByPhone(phone: Phone): Promise<Result<User>> {
    const dbUser = await this._prisma.user.findUnique({
      where: {
        phone: phone.getValue(),
      },
      include: {
        roles: true,
      },
    });

    if (!dbUser) return Result.fail('User not found');

    const userResult = UserMapper.toDomain(dbUser);
    if (userResult.isFailure) {
      return Result.fail(userResult.getError());
    }

    return Result.ok(userResult.getValue());
  }

  async save(user: User): Promise<void> {
    const persistantUser = UserMapper.toPersistence(user);

    await this._prisma.user.upsert({
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
