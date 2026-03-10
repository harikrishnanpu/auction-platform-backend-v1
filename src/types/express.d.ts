import { AuthUser } from '@presentation/types/auth.user';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends AuthUser {}
  }
}

export {};
