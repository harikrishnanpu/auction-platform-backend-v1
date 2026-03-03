import { User } from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Email } from '@domain/value-objects/email.vo';
import { Phone } from '@domain/value-objects/phone.vo';
import { PrismaClient } from '@prisma/client';

export class PrismaUserRepo implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

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

    return User.create({
      id: dbUser.id,
      email: Email.create(dbUser.email).getValue(),
      password: dbUser.password,
      name: dbUser.name,
      phone: dbUser.phone ? Phone.create(dbUser.phone).getValue() : null,
      address: dbUser.address,
      city: dbUser.city,
      state: dbUser.state,
      zipCode: dbUser.zipCode,
      country: dbUser.country,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
      roles: dbUser.roles.map((role) => role.name),
    });
  }
}
