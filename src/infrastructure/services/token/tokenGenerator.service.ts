import { ITokenGeneratorService } from '@application/interfaces/services/ITokenGeneratorService';
import jwt from 'jsonwebtoken';

export class TokenGenerator implements ITokenGeneratorService {
  private _accessTokenSecret: string;
  private _refreshTokenSecret: string;

  constructor() {
    if (
      !process.env.JWT_ACCESSTOKEN_SECRET ||
      !process.env.JWT_REFRESHTOKEN_SECRET
    ) {
      throw new Error(
        'jwt secret issue: env file does not contains jwt secret',
      );
    }

    this._accessTokenSecret = process.env.JWT_ACCESSTOKEN_SECRET;
    this._refreshTokenSecret = process.env.JWT_REFRESHTOKEN_SECRET;
  }

  generateAccessToken(payload: string): string {
    return jwt.sign(payload, this._accessTokenSecret);
  }

  generateRefreshToken(payload: string): string {
    return jwt.sign(payload, this._refreshTokenSecret);
  }

  verifyAccesstoken(token: string): string {
    return jwt.verify(token, this._accessTokenSecret) as string;
  }

  verifyRefreshToken(token: string): string {
    return jwt.verify(token, this._refreshTokenSecret) as string;
  }
}
