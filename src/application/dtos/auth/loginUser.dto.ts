import { userResponseDto } from '@application/dtos/user/userResponse.dto';

export type { userResponseDto };
export { UserRoleType } from './userRole.dto';

export interface LoginUserInput {
    email: string;
    password: string;
}

export interface LoginUserOutput {
    user: userResponseDto;
    accessToken: string;
    refreshToken: string;
}
