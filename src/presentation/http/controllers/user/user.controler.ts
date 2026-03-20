import { TYPES } from '@di/types.di';
import expressAsyncHandler from 'express-async-handler';
import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { AppError } from '@presentation/http/error/app.error';
import { IChangeProfilePasswordUsecase } from '@application/interfaces/usecases/user/IChangeProfilePassword';
import { ChangeProfilePasswordInput } from '@application/dtos/user/userProfile.dto';
import { changeProfilePasswordSchema } from '@presentation/validators/schemas/user/change-profile-password.schema';
import { USER_PROFILE_CONSTANTS } from '@presentation/constants/user/user-profile.constants';
import { ISendOtpUsecase } from '@application/interfaces/usecases/otp/ISendOtpUsecase';
import { SendVerificationCodeInputDto } from '@application/dtos/otp/SendOtp.dto';
import { OtpChannel, OtpPurpose } from '@domain/entities/otp/otp.entity';
import { EditProfileInput } from '@application/dtos/user/editProfile.dto';
import { IEditProfileUsecase } from '@application/interfaces/usecases/user/IEditProfileUsecase';
import { editProfileSchema } from '@presentation/validators/schemas/user/editProfile.schema';
import { AvatarUploadUrlRequestDto } from '@application/dtos/user/avatarUploadUrl.dto';
import { IGenerateAvatarUploadUrlUsecase } from '@application/interfaces/usecases/user/IGenerateAvatarUploadUrlUsecase';
import { generateUploadUrlSchema } from '@presentation/validators/schemas/user/generate-upload-url.schema';
import { updateAvatarUrlSchema } from '@presentation/validators/schemas/user/update-avatar-url.schema';
import { UpdateAvatarUrlRequestDto } from '@application/dtos/user/updateAvatar.dto';
import { IUpdateAvatarUrlUsecase } from '@application/interfaces/usecases/user/IUpdateAvatarUrl';

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

      res.status(USER_PROFILE_CONSTANTS.CODES.OK).json({
        data: null,
        success: true,
        message:
          USER_PROFILE_CONSTANTS.MESSAGES
            .PROFILE_CHANGE_PASSWORD_EMAIL_SENT_SUCCESSFULLY,
        status: USER_PROFILE_CONSTANTS.CODES.OK,
        error: null,
      });
    },
  );

  changeProfilePassword = expressAsyncHandler(
    async (req: Request, res: Response) => {
      // console.log(req.body);
      const parsedData = changeProfilePasswordSchema.safeParse(req.body);

      if (!parsedData.success) {
        throw new AppError(
          parsedData.error.issues[0].message,
          USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      if (!req.user) {
        throw new AppError(
          USER_PROFILE_CONSTANTS.MESSAGES.USER_NOT_FOUND,
          USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const changeProfilePasswordDto: ChangeProfilePasswordInput = {
        userId: req.user.id,
        otp: parsedData.data.otp,
        oldPassword: parsedData.data.oldPassword,
        newPassword: parsedData.data.newPassword,
      };

      console.log(
        'CHANGE PROFILE PASSWORD DTO CALLING',
        changeProfilePasswordDto,
      );

      const user = await this._changeProfilePasswordUseCase.execute(
        changeProfilePasswordDto,
      );

      if (user.isFailure) {
        throw new AppError(
          user.getError(),
          USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      res.status(USER_PROFILE_CONSTANTS.CODES.OK).json({
        data: user.getValue(),
        success: true,
        message:
          USER_PROFILE_CONSTANTS.MESSAGES.CHANGE_PROFILE_PASSWORD_SUCCESSFULLY,
        status: USER_PROFILE_CONSTANTS.CODES.OK,
        error: null,
      });
    },
  );

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

      res.status(USER_PROFILE_CONSTANTS.CODES.OK).json({
        data: null,
        success: true,
        message:
          USER_PROFILE_CONSTANTS.MESSAGES.EDIT_PROFILE_SEND_OTP_SUCCESSFULLY,
        status: USER_PROFILE_CONSTANTS.CODES.OK,
        error: null,
      });
    },
  );

  editProfile = expressAsyncHandler(async (req: Request, res: Response) => {
    console.log('EDIT PROFILE=---', req.body);

    const parsedData = editProfileSchema.safeParse(req.body);

    if (!parsedData.success) {
      throw new AppError(
        parsedData.error.issues[0].message,
        USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    if (!req.user) {
      throw new AppError(
        USER_PROFILE_CONSTANTS.MESSAGES.USER_NOT_FOUND,
        USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const editProfileInput: EditProfileInput = {
      userId: req.user.id,
      otp: parsedData.data.otp,
      name: parsedData.data.name,
      email: req.user.email,
      phone: parsedData.data.phone,
      address: parsedData.data.address,
    };

    const result = await this._editProfileUseCase.execute(editProfileInput);
    if (result.isFailure) {
      throw new AppError(
        result.getError(),
        USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    res.status(USER_PROFILE_CONSTANTS.CODES.OK).json({
      data: result.getValue(),
      success: true,
      message: USER_PROFILE_CONSTANTS.MESSAGES.EDIT_PROFILE_SUCCESSFULLY,
      status: USER_PROFILE_CONSTANTS.CODES.OK,
      error: null,
    });
  });

  generateAvatarUploadUrl = expressAsyncHandler(
    async (req: Request, res: Response) => {
      const parsedData = generateUploadUrlSchema.safeParse(req.body);

      if (!parsedData.success) {
        throw new AppError(
          parsedData.error.issues[0].message,
          USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      if (!req.user) {
        throw new AppError(
          USER_PROFILE_CONSTANTS.MESSAGES.USER_NOT_FOUND,
          USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const generateAvatarUploadUrlInput: AvatarUploadUrlRequestDto = {
        userId: req.user.id,
        contentType: parsedData.data.contentType,
        fileName: parsedData.data.fileName,
        fileSize: parsedData.data.fileSize,
      };

      const result = await this._generateAvatarUploadUrlUseCase.execute(
        generateAvatarUploadUrlInput,
      );

      if (result.isFailure) {
        throw new AppError(
          result.getError(),
          USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      res.status(USER_PROFILE_CONSTANTS.CODES.OK).json({
        data: result.getValue(),
        success: true,
        message:
          USER_PROFILE_CONSTANTS.MESSAGES
            .GENERATE_AVATAR_UPLOAD_URL_SUCCESSFULLY,
        status: USER_PROFILE_CONSTANTS.CODES.OK,
        error: null,
      });
    },
  );

  updateAvatarUrl = expressAsyncHandler(async (req: Request, res: Response) => {
    const parsedData = updateAvatarUrlSchema.safeParse(req.body);

    if (!parsedData.success) {
      throw new AppError(
        parsedData.error.issues[0].message,
        USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    if (!req.user) {
      throw new AppError(
        USER_PROFILE_CONSTANTS.MESSAGES.USER_NOT_FOUND,
        USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const updateAvatarUrlInput: UpdateAvatarUrlRequestDto = {
      userId: req.user.id,
      avatarKey: parsedData.data.fileKey,
    };

    const result =
      await this._updateAvatarUrlUseCase.execute(updateAvatarUrlInput);

    if (result.isFailure) {
      throw new AppError(
        result.getError(),
        USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    res.status(USER_PROFILE_CONSTANTS.CODES.OK).json({
      data: result.getValue(),
      success: true,
      message: USER_PROFILE_CONSTANTS.MESSAGES.UPDATE_AVATAR_URL_SUCCESSFULLY,
      status: USER_PROFILE_CONSTANTS.CODES.OK,
      error: null,
    });
  });
}
