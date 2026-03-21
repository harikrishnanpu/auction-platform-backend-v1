import type { AuthUser } from '@presentation/types/auth.user';

declare module 'socket.io' {
  interface SocketData {
    user: AuthUser;
  }
}

export {};
