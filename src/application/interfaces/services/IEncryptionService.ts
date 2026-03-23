import { Result } from '@domain/shared/result';

export interface IEncryptionService {
    encrypt(data: string): Result<string>;
    decrypt(data: string): Result<string>;
}
