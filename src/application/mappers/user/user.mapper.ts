import { GenerateAvatarUploadUrlInput } from '@application/dtos/user/avatarUploadUrl.dto';
import { EditProfileInput } from '@application/dtos/user/editProfile.dto';
import { UpdateAvatarUrlRequestDto } from '@application/dtos/user/updateAvatar.dto';
import { ChangeProfilePasswordInput } from '@application/dtos/user/userProfile.dto';
import { ZodChangeProfilePasswordInputType } from '@presentation/validators/schemas/user/change-profile-password.schema';
import { ZodEditProfileInputType } from '@presentation/validators/schemas/user/editProfile.schema';
import { ZodGenerateUploadUrlInputType } from '@presentation/validators/schemas/user/generate-upload-url.schema';
import { ZodUpdateAvatarUrlInputType } from '@presentation/validators/schemas/user/update-avatar-url.schema';

export class UserMapperProfile {
    public static toChangeProfilePasswordInput(
        data: ZodChangeProfilePasswordInputType,
    ): ChangeProfilePasswordInput {
        return {
            userId: data.userId,
            otp: data.otp,
            oldPassword: data.oldPassword,
            newPassword: data.newPassword,
        };
    }

    public static toEditProfileInput(
        data: ZodEditProfileInputType,
    ): EditProfileInput {
        return {
            userId: data.userId,
            otp: data.otp,
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
        };
    }

    public static toGenerateAvatarUploadUrlInput(
        data: ZodGenerateUploadUrlInputType,
    ): GenerateAvatarUploadUrlInput {
        return {
            userId: data.userId,
            contentType: data.contentType,
            fileName: data.fileName,
            fileSize: data.fileSize,
        };
    }

    public static toUpdateAvatarUrlInput(
        data: ZodUpdateAvatarUrlInputType,
    ): UpdateAvatarUrlRequestDto {
        return {
            userId: data.userId,
            avatarKey: data.fileKey,
        };
    }
}
