import { IPasswordService } from '@application/interfaces/services/IPasswordService';
import { Argon2Service } from '@infrastructure/security/argon2Service';
import { TYPES } from 'di/types.di';
import { inject, injectable } from 'inversify';

@injectable()
export class PasswordService implements IPasswordService {
  constructor(
    @inject(TYPES.Argon2Service)
    private _hashingService: Argon2Service,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return await this._hashingService.hash(password);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await this._hashingService.verify(hash, password);
  }
}
