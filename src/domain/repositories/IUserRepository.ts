import { User } from '@domain/entities/user.entity';
import { Email } from '@domain/value-objects/email.vo';
import { Phone } from '@domain/value-objects/phone.vo';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByPhone(phone: Phone): Promise<User | null>;
  save(user: User): Promise<void>;
}
