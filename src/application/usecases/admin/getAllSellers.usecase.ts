import {
  IGetAllSellersInput,
  IGetAllSellersOutput,
  ISellerResponseDto,
} from '@application/dtos/admin/getSellers.dto';
import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import { IGetAllSellersUsecase } from '@application/interfaces/usecases/admin/IGetAllSellersUsecase';
import { TYPES } from '@di/types.di';
import { KycFor, KycStatus } from '@domain/entities/kyc/kyc.entity';
import { IKycRepository } from '@domain/repositories/IKycRespository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetAllSellersUseCase implements IGetAllSellersUsecase {
  constructor(
    @inject(TYPES.IKycRepository)
    private readonly _kycRepository: IKycRepository,
    @inject(TYPES.IUserRepository)
    private readonly _userRepository: IUserRepository,
  ) {}

  async execute(
    data: IGetAllSellersInput,
  ): Promise<Result<IGetAllSellersOutput>> {
    try {
      const { page, limit, pendingOnly } = data;
      const skip = (page - 1) * limit;

      const kycsResult = await this._kycRepository.findAllByKycFor(
        KycFor.SELLER,
        {
          excludeStatus: pendingOnly ? KycStatus.NOT_SUBMITTED : undefined,
          skip,
          take: limit,
        },
      );

      if (kycsResult.isFailure) {
        console.log(kycsResult.getError());
        return Result.fail(kycsResult.getError());
      }

      const { kycs, total } = kycsResult.getValue();
      if (kycs.length === 0) {
        return Result.ok({
          sellers: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        });
      }

      const userIds = kycs.map((kyc) => kyc.getUserId());
      const usersResult = await this._userRepository.findManyByIds(userIds);

      if (usersResult.isFailure) {
        console.log(usersResult.getError());
        return Result.fail(usersResult.getError());
      }

      const users = usersResult.getValue();
      const kycByUserId = new Map(kycs.map((k) => [k.getUserId(), k]));

      const sellers: ISellerResponseDto[] = users.map((user) => {
        const kyc = kycByUserId.get(user.getId());
        return {
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
          kycStatus: kyc!.getStatus(),
        };
      });

      return Result.ok({
        sellers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.log(error);
      return Result.fail('UNEXPECTED ERROR FROM GET ALL SELLERS USECASE');
    }
  }
}
