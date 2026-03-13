import {
  IGetAdminSellerInput,
  IGetAdminSellerOutput,
  IAdminSellerDetailDto,
  IKycDocumentDto,
} from '@application/dtos/admin/getAdminSeller.dto';
import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import { IGetAdminSellerUsecase } from '@application/interfaces/usecases/admin/IGetAdminSellerUsecase';
import { TYPES } from '@di/types.di';
import { KycFor } from '@domain/entities/kyc/kyc.entity';
import { IKycRepository } from '@domain/repositories/IKycRespository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetAdminSellerUseCase implements IGetAdminSellerUsecase {
  constructor(
    @inject(TYPES.IUserRepository)
    private readonly _userRepository: IUserRepository,
    @inject(TYPES.IKycRepository)
    private readonly _kycRepository: IKycRepository,
  ) {}

  async execute(
    data: IGetAdminSellerInput,
  ): Promise<Result<IGetAdminSellerOutput>> {
    try {
      const { sellerId } = data;

      const userResult = await this._userRepository.findById(sellerId);
      if (userResult.isFailure) {
        return Result.fail(userResult.getError());
      }

      const user = userResult.getValue();
      const kycResult = await this._kycRepository.findByUserIdAndFor(
        sellerId,
        KycFor.SELLER,
      );

      const sellerDto: IAdminSellerDetailDto = {
        id: user.getId(),
        name: user.getName(),
        email: user.getEmail().getValue(),
        phone: user.getPhone()?.getValue() ?? '',
        address: user.getAddress() ?? '',
        avatar_url: user.getAvatarUrl() ?? '',
        isProfileCompleted: user.isProfileCompleted(),
        isVerified: user.getIsVerified(),
        status: user.getStatus(),
        authProvider: user.getAuthProvider().getType(),
        roles: user.getRoles().map((r) => r.getValue() as UserRoleType),
      };

      if (kycResult.getValue()) {
        const kyc = kycResult.getValue()!;
        sellerDto.kycStatus = kyc.getStatus();
        const docs = kyc.getDocuments();
        const documentsDto: IKycDocumentDto[] = docs.map((d) => ({
          id: d.getId(),
          kycId: d.getKycId(),
          documentType: d.getDocumentType(),
          side: d.getSide(),
          documentUrl: d.getDocumentUrl(),
          documentStatus: d.getDocumentStatus(),
        }));
        sellerDto.kyc = {
          id: kyc.getId(),
          userId: kyc.getUserId(),
          status: kyc.getStatus(),
          for: kyc.getFor(),
          rejectionReason: kyc.getRejectionReason(),
          documents: documentsDto,
        };
      }

      return Result.ok({ seller: sellerDto });
    } catch (error) {
      console.log(error);
      return Result.fail('UNEXPECTED ERROR FROM GET ADMIN SELLER USECASE');
    }
  }
}
