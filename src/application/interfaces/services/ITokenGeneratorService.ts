export interface ITokenGeneratorService {
  generateAccessToken(payload: string): string;
  generateRefreshToken(payload: string): string;
  verifyAccesstoken(token: string): string;
  verifyRefreshToken(token: string): string;
}
