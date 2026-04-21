import { User } from '@domain/entities/user/user.entity';
import { Result } from '@domain/shared/result';
import { IFindAllUsersInput } from '@domain/types/userRepo.types';
import { Email } from '@domain/value-objects/email.vo';
import { Phone } from '@domain/value-objects/phone.vo';
import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import { UserStatus } from '@domain/entities/user/user.entity';

export interface IUserRepository {
    findById(id: string): Promise<Result<User>>;
    findManyByIds(ids: string[]): Promise<Result<User[]>>;
    findByEmail(email: Email): Promise<Result<User>>;
    findByPhone(phone: Phone): Promise<Result<User>>;
    findAll(input: IFindAllUsersInput): Promise<Result<User[]>>;
    count(input?: {
        role?: UserRoleType;
        status?: UserStatus;
    }): Promise<Result<number>>;
    save(user: User): Promise<Result<User>>;
}
