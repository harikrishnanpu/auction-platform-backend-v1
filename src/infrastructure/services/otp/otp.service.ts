import { IOtpService } from '@application/interfaces/services/IOtpService';

export class OtpService implements IOtpService {
  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
