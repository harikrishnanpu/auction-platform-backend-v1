import { STORAGE_CONSTANTS } from '@application/constants/storage/storage.constants';
import { AvatarUploadUrlResponseDto } from '@application/dtos/user/avatarUploadUrl.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import {
    GenerateUploadUrlData,
    IStorageService,
} from '@application/interfaces/services/IStorageService';
import {
    IGenerateAvatarUploadUrlUsecase,
    IValidatedGenerateAvatarUploadUrlInput,
} from '@application/interfaces/usecases/user/IGenerateAvatarUploadUrlUsecase';

import { TYPES } from '@di/types.di';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';
import { UserMapperProfile } from '@application/mappers/user/user.mapper';

@injectable()
export class GenerateAvatarUploadUrlUseCase implements IGenerateAvatarUploadUrlUsecase {
    constructor(
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
        @inject(TYPES.IStorageService)
        private readonly _storageService: IStorageService,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
    ) {}

    async execute(
        data: IValidatedGenerateAvatarUploadUrlInput,
    ): Promise<Result<AvatarUploadUrlResponseDto>> {
        try {
            const dto = UserMapperProfile.toGenerateAvatarUploadUrlInput(data);

            const userEntity = await this._userRepository.findById(dto.userId);
            if (userEntity.isFailure) {
                return Result.fail(userEntity.getError());
            }

            if (
                !STORAGE_CONSTANTS.AVATAR_CONTENT_TYPES.includes(
                    dto.contentType,
                )
            ) {
                return Result.fail('INVALID CONTENT TYPE FOR AVATAR');
            }

            const fileName = `avatars/${this._idGeneratingService.generateId()}-${dto.fileName}`;

            const generateUploadUrlData: GenerateUploadUrlData = {
                contentType: dto.contentType,
                fileName: fileName,
                fileSize: dto.fileSize,
            };

            const uploadUrl = await this._storageService.generateUploadUrl(
                generateUploadUrlData,
            );

            if (uploadUrl.isFailure) {
                return Result.fail(uploadUrl.getError());
            }

            const avatarUploadUrlResponseDto: AvatarUploadUrlResponseDto = {
                uploadUrl: uploadUrl.getValue(),
                fileKey: fileName,
            };

            return Result.ok(avatarUploadUrlResponseDto);
        } catch (err) {
            console.log(err);
            return Result.fail(
                'UNEXPECTED ERROR FROM GENERATE AVATAR UPLOAD URL USECASE',
            );
        }
    }
}
