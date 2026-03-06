import {
  User,
  AuthProviderType,
  UserStatus,
} from '@domain/entities/user/user.entity';
import { Result } from '@domain/shared/result';
import { AuthProvider } from '@domain/value-objects/auth-provider.vo';
import { Email } from '@domain/value-objects/email.vo';
import { Phone } from '@domain/value-objects/phone.vo';
import { UserRole } from '@domain/value-objects/user-roles.vo';
import { User as PrismaUser, UserRole as PrismaUserRole } from '@prisma/client';

type PrismaUserWithRoles = PrismaUser & {
  roles: PrismaUserRole[];
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

    let authProviderVo: AuthProvider;

    if (dbUser.authProvider === 'LOCAL') {
      authProviderVo = AuthProvider.createLocal(dbUser.password || '');
    } else {
      authProviderVo = AuthProvider.createOAuth(
        AuthProviderType.GOOGLE,
        dbUser.id,
      );
    }

    const roles = new Set<UserRole>();
    dbUser.roles.forEach((dbRole) => {
      roles.add(UserRole[dbRole.role]);
    });

    const finalDomainUser = User.create({
      id: dbUser.id,
      name: dbUser.name,
      email: userEmail,
      phone: userPhone,
      address: dbUser.address,
      authProvider: authProviderVo,
      roles: [...roles],
      status: UserStatus[dbUser.status],
    });

    return finalDomainUser;
  }

  public static toPersistence(user: User) {
    let passwordHash: string | null = null;
    const authProvider = user.getAuthProvider();

    if (authProvider.getType() === AuthProviderType.LOCAL) {
      const passwordHashResult = authProvider.getPasswordHash();
      if (passwordHashResult.isFailure) {
        throw new Error(passwordHashResult.getError());
      }
      passwordHash = passwordHashResult.getValue();
    }

    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail().getValue(),
      password: passwordHash,
      phone: user.getPhone()?.getValue() ?? null,
      address: user.getAddress(),
      status: user.getStatus(),
      authProvider: user.getAuthProvider().getType(),
      roles: user.getRoles().map((r) => r.getValue()),
    };
  }
}
