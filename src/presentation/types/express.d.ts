import 'express';
import { User } from '@domain/entities/user/user.entity';

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export {};
