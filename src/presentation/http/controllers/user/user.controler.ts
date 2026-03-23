import { TYPES } from '@di/types.di';
import expressAsyncHandler from 'express-async-handler';
import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { AppError } from '@presentation/http/error/app.error';
import { IChangeProfilePasswordUsecase } from '@application/interfaces/usecases/user/IChangeProfilePassword';
import { ChangeProfilePasswordInput } from '@application/dtos/user/userProfile.dto';
import {
  changeProfilePasswordSchema,
  ZodChangeProfilePasswordInputType,
} from '@presentation/validators/schemas/user/change-profile-password.schema';
import { USER_PROFILE_CONSTANTS } from '@presentation/constants/user/user-profile.constants';
import { ISendOtpUsecase } from '@application/interfaces/usecases/otp/ISendOtpUsecase';
import { SendVerificationCodeInputDto } from '@application/dtos/otp/SendOtp.dto';
import { OtpChannel, OtpPurpose } from '@domain/entities/otp/otp.entity';
import {
  EditProfileInput,
  EditProfileOutput,
} from '@application/dtos/user/editProfile.dto';
import { IEditProfileUsecase } from '@application/interfaces/usecases/user/IEditProfileUsecase';
import {
  editProfileSchema,
  ZodEditProfileInputType,
} from '@presentation/validators/schemas/user/editProfile.schema';
import { GenerateAvatarUploadUrlInput } from '@application/dtos/user/avatarUploadUrl.dto';
import { IGenerateAvatarUploadUrlUsecase } from '@application/interfaces/usecases/user/IGenerateAvatarUploadUrlUsecase';
import {
  generateUploadUrlSchema,
  ZodGenerateUploadUrlInputType,
} from '@presentation/validators/schemas/user/generate-upload-url.schema';
import {
  updateAvatarUrlSchema,
  ZodUpdateAvatarUrlInputType,
} from '@presentation/validators/schemas/user/update-avatar-url.schema';
import {
  UpdateAvatarUrlRequestDto,
  UpdateAvatarUrlResponseDto,
} from '@application/dtos/user/updateAvatar.dto';
import { IUpdateAvatarUrlUsecase } from '@application/interfaces/usecases/user/IUpdateAvatarUrl';
import { ResponseHelper } from '@presentation/http/helpers/response.helper';
import { ValidationHelper } from '@presentation/http/helpers/validation.helper';
import { UserMapperProfile } from '@application/mappers/user/user.mapper';

@injectable()
export class UserController {
  constructor(
    @inject(TYPES.IChangeProfilePasswordUsecase)
    private readonly _changeProfilePasswordUseCase: IChangeProfilePasswordUsecase,
    @inject(TYPES.ISendOtpUsecase)
    private readonly _sendOtpUseCase: ISendOtpUsecase,
    @inject(TYPES.IEditProfileUsecase)
    private readonly _editProfileUseCase: IEditProfileUsecase,
    @inject(TYPES.IGenerateAvatarUploadUrlUsecase)
    private readonly _generateAvatarUploadUrlUseCase: IGenerateAvatarUploadUrlUsecase,
    @inject(TYPES.IUpdateAvatarUrlUsecase)
    private readonly _updateAvatarUrlUseCase: IUpdateAvatarUrlUsecase,
  ) {}

  /**
   * @description Send a profile change password otp to the user's email
   * @returns ApiResponse<null>
   */

  sendProfileChangePasswordOtp = expressAsyncHandler(
    async (req: Request, res: Response) => {
      if (!req.user) {
        throw new AppError(
          USER_PROFILE_CONSTANTS.MESSAGES.USER_NOT_FOUND,
          USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const sendOtpInput: SendVerificationCodeInputDto = {
        email: req.user.email,
        purpose: OtpPurpose.CHANGE_PROFILE_PASSWORD,
        channel: OtpChannel.EMAIL,
      };

      const result = await this._sendOtpUseCase.execute(sendOtpInput);

      if (result.isFailure) {
        throw new AppError(
          result.getError(),
          USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      ResponseHelper.success<null>(
        res,
        null,
        USER_PROFILE_CONSTANTS.MESSAGES
          .PROFILE_CHANGE_PASSWORD_EMAIL_SENT_SUCCESSFULLY,
        USER_PROFILE_CONSTANTS.CODES.OK,
      );
    },
  );

  /**
   * @description Change the user's profile password
   * @returns ApiResponse<null>
   */

  changeProfilePassword = expressAsyncHandler(
    async (req: Request, res: Response) => {
      // console.log(req.body);
      const validationResult =
        ValidationHelper.validate<ZodChangeProfilePasswordInputType>(
          changeProfilePasswordSchema,
          req.body,
        );

      if (!req.user) {
        throw new AppError(
          USER_PROFILE_CONSTANTS.MESSAGES.USER_NOT_FOUND,
          USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const dto: ChangeProfilePasswordInput =
        UserMapperProfile.toChangeProfilePasswordInput(
          validationResult,
          req.user.id,
        );

      const user = await this._changeProfilePasswordUseCase.execute(dto);

      if (user.isFailure) {
        throw new AppError(
          user.getError(),
          USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      ResponseHelper.success<null>(
        res,
        null,
        USER_PROFILE_CONSTANTS.MESSAGES.CHANGE_PROFILE_PASSWORD_SUCCESSFULLY,
        USER_PROFILE_CONSTANTS.CODES.OK,
      );
    },
  );

  /**
   * @description Send a edit profile otp to the user's email
   * @returns ApiResponse<null>
   */

  editProfileSendOtp = expressAsyncHandler(
    async (req: Request, res: Response) => {
      if (!req.user) {
        throw new AppError(
          USER_PROFILE_CONSTANTS.MESSAGES.USER_NOT_FOUND,
          USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const sendOtpInput: SendVerificationCodeInputDto = {
        email: req.user.email,
        purpose: OtpPurpose.EDIT_PROFILE,
        channel: OtpChannel.EMAIL,
      };

      const result = await this._sendOtpUseCase.execute(sendOtpInput);

      if (result.isFailure) {
        throw new AppError(
          result.getError(),
          USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      ResponseHelper.success<null>(
        res,
        null,
        USER_PROFILE_CONSTANTS.MESSAGES.EDIT_PROFILE_SEND_OTP_SUCCESSFULLY,
        USER_PROFILE_CONSTANTS.CODES.OK,
      );
    },
  );

  /**
   * @description Edit the user's profile
   * @returns ApiResponse<EditProfileOutput>
   */

  editProfile = expressAsyncHandler(async (req: Request, res: Response) => {
    // console.log('EDIT PROFILE=---', req.body);

    const validationResult = ValidationHelper.validate<ZodEditProfileInputType>(
      editProfileSchema,
      req.body,
    );

    if (!req.user) {
      throw new AppError(
        USER_PROFILE_CONSTANTS.MESSAGES.USER_NOT_FOUND,
        USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const dto: EditProfileInput = UserMapperProfile.toEditProfileInput(
      validationResult,
      req.user.id,
      req.user.email,
    );

    const result = await this._editProfileUseCase.execute(dto);

    if (result.isFailure) {
      throw new AppError(
        result.getError(),
        USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    ResponseHelper.success<EditProfileOutput>(
      res,
      result.getValue(),
      USER_PROFILE_CONSTANTS.MESSAGES.EDIT_PROFILE_SUCCESSFULLY,
      USER_PROFILE_CONSTANTS.CODES.OK,
    );
  });

  generateAvatarUploadUrl = expressAsyncHandler(
    async (req: Request, res: Response) => {
      const validationResult =
        ValidationHelper.validate<ZodGenerateUploadUrlInputType>(
          generateUploadUrlSchema,
          req.body,
        );

      if (!req.user) {
        throw new AppError(
          USER_PROFILE_CONSTANTS.MESSAGES.USER_NOT_FOUND,
          USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const dto: GenerateAvatarUploadUrlInput =
        UserMapperProfile.toGenerateAvatarUploadUrlInput(
          validationResult,
          req.user.id,
        );

      const result = await this._generateAvatarUploadUrlUseCase.execute(dto);

      if (result.isFailure) {
        throw new AppError(
          result.getError(),
          USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      ResponseHelper.success(
        res,
        result.getValue(),
        USER_PROFILE_CONSTANTS.MESSAGES.GENERATE_AVATAR_UPLOAD_URL_SUCCESSFULLY,
        USER_PROFILE_CONSTANTS.CODES.OK,
      );
    },
  );

  updateAvatarUrl = expressAsyncHandler(async (req: Request, res: Response) => {
    const validationResult =
      ValidationHelper.validate<ZodUpdateAvatarUrlInputType>(
        updateAvatarUrlSchema,
        req.body,
      );

    if (!req.user) {
      throw new AppError(
        USER_PROFILE_CONSTANTS.MESSAGES.USER_NOT_FOUND,
        USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const dto: UpdateAvatarUrlRequestDto =
      UserMapperProfile.toUpdateAvatarUrlInput(validationResult, req.user.id);

    const result = await this._updateAvatarUrlUseCase.execute(dto);

    if (result.isFailure) {
      throw new AppError(
        result.getError(),
        USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    ResponseHelper.success<UpdateAvatarUrlResponseDto>(
      res,
      result.getValue(),
      USER_PROFILE_CONSTANTS.MESSAGES.UPDATE_AVATAR_URL_SUCCESSFULLY,
      USER_PROFILE_CONSTANTS.CODES.OK,
    );
  });
}
