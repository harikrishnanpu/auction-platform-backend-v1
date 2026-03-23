import { IEncryptionService } from '@application/interfaces/services/IEncryptionService';
import { Result } from '@domain/shared/result';
import CryptoJS from 'crypto-js';

export class EncryptService implements IEncryptionService {
    private _encryptClient: typeof CryptoJS.AES;
    private _encryptionSecret: string;

    constructor() {
        if (!process.env.ENCRYPTION_SECRET) {
            throw new Error('ENCRYPTION_SECRET is not defined');
        }
        this._encryptClient = CryptoJS.AES;
        this._encryptionSecret = process.env.ENCRYPTION_SECRET;
    }

    encrypt(data: string): Result<string> {
        try {
            return Result.ok(
                this._encryptClient
                    .encrypt(data, this._encryptionSecret)
                    .toString(),
            );
        } catch (error) {
            console.log(error);
            return Result.fail('UNEXPECTED ERROR FROM ENCRYPT');
        }
    }

    decrypt(data: string): Result<string> {
        try {
            return Result.ok(
                this._encryptClient
                    .decrypt(data, this._encryptionSecret)
                    .toString(),
            );
        } catch (error) {
            console.log(error);
            return Result.fail('UNEXPECTED ERROR FROM DECRYPT');
        }
    }
}
