import { User } from '@domain/entities/user/user.entity';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Email } from '@domain/value-objects/email.vo';
import { PrismaClient } from '@prisma/client';
import { Phone } from '@domain/value-objects/phone.vo';
import { inject, injectable } from 'inversify';
import { TYPES } from 'di/types.di';
import { Result } from '@domain/shared/result';
import { IFindAllUsersInput } from '@domain/types/userRepo.types';
import { BaseRepository } from '../base/base.Repo';
import { User as PrismaUser } from '@prisma/client';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import { UserStatus } from '@domain/entities/user/user.entity';

@injectable()
export class PrismaUserRepo
    extends BaseRepository<
        User,
        PrismaUser,
        IFindAllUsersInput,
        IDbMapper<User, PrismaUser>
    >
    implements IUserRepository
{
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
        @inject(TYPES.UserMapper)
        readonly mapper: IDbMapper<User, PrismaUser>,
    ) {
        super(_prisma.user, mapper);
    }

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

        const userResult = this.mapper.toDomain(dbUser);
        if (userResult.isFailure) return Result.fail(userResult.getError());

        return Result.ok(userResult.getValue());
    }

    async findManyByIds(ids: string[]): Promise<Result<User[]>> {
        if (ids.length === 0) return Result.ok([]);

        const dbUsers = await this._prisma.user.findMany({
            where: { id: { in: ids } },
            include: { roles: true },
        });

        const users: User[] = [];
        for (const dbUser of dbUsers) {
            const userResult = this.mapper.toDomain(dbUser);
            if (userResult.isFailure) return Result.fail(userResult.getError());
            users.push(userResult.getValue());
        }
        return Result.ok(users);
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

        const userResult = this.mapper.toDomain(dbUser);
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

        const userResult = this.mapper.toDomain(dbUser);
        if (userResult.isFailure) {
            return Result.fail(userResult.getError());
        }

        return Result.ok(userResult.getValue());
    }

    async save(user: User): Promise<Result<User>> {
        const persistantUser = this.mapper.toPersistence(user) as PrismaUser;

        await this._prisma.user.upsert({
            where: {
                id: user.getId(),
            },
            update: {
                ...persistantUser,
                roles: {
                    deleteMany: {},
                    create: user
                        .getRoles()
                        .map((r) => ({ role: r.getValue() })),
                },
            },
            create: {
                ...persistantUser,
                roles: {
                    create: user
                        .getRoles()
                        .map((r) => ({ role: r.getValue() })),
                },
            },
        });

        return Result.ok();
    }

    async count(input?: {
        role?: UserRoleType;
        status?: UserStatus;
    }): Promise<Result<number>> {
        try {
            const total = await this._prisma.user.count({
                where: {
                    roles: input?.role
                        ? { some: { role: input.role } }
                        : undefined,
                    status: input?.status,
                },
            });
            return Result.ok(total);
        } catch {
            return Result.fail('Failed to count users');
        }
    }

    async findAll(input: IFindAllUsersInput): Promise<Result<User[]>> {
        const { page, limit, search, sort, order, role, status, authProvider } =
            input;

        const users = await this._prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                ],
                roles: { some: { role: role } },
                status: status,
                authProvider: authProvider,
            },
            orderBy: {
                [sort]: order,
            },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                roles: true,
            },
        });

        return Result.ok(
            users.map((user) => this.mapper.toDomain(user).getValue()),
        );
    }
}
