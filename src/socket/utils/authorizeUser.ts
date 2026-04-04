import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import { AuthUser } from '@presentation/types/auth.user';
import { SocketAckPayload } from 'socket/socket.ack';

export const authorizeUser = (
    user: AuthUser,
    allowedRoles: UserRoleType[],
): SocketAckPayload | null => {
    if (!allowedRoles.some((role) => user.roles.includes(role))) {
        return { success: false, error: 'Unauthorized' };
    }

    return null;
};
