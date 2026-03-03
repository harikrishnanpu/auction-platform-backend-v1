import { User } from '@domain/entities/user.entity';
import { Result } from '@domain/shared/result';
import { Email } from '@domain/value-objects/email.vo';
import { Phone } from '@domain/value-objects/phone.vo';
import { User as PrismaUser } from '@prisma/client';

type PrismaUserWithRoles = PrismaUser & {
  roles: { name: string }[];
};

export class UserMapper {
  public static toDomain(dbUser: PrismaUserWithRoles): Result<User> {
    let userPhone: Phone | null = null;

    const userEmailVo = Email.create(dbUser.email);
    if (userEmailVo.isFailure) {
      return Result.fail('invalid email from db');
    }

    const userEmail = userEmailVo.getValue();

    if (dbUser.phone) {
      const voPhone = Phone.create(dbUser.phone);

      if (voPhone.isFailure) {
        return Result.fail('invalid phone from db');
      }

      userPhone = voPhone.getValue();
    }

    return User.create({
      id: dbUser.id,
      email: userEmail,
      name: dbUser.name,
      phone: userPhone,
      address: dbUser.address,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
      roles: dbUser.roles.map((role) => role.name),
    });
  }
}
