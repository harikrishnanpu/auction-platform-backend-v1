export interface ITokenGeneratorService {
  generateAccessToken(payload: string): string;
  generateRefreshToken(payload: string): string;
  generateToken(payload: string): string;
  verifyToken(token: string): string;
  verifyAccesstoken(token: string): string;
  verifyRefreshToken(token: string): string;
}
