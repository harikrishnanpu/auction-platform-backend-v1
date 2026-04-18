import { IRejectSellerKycOutput } from '@application/dtos/admin/rejectSellerKyc.dto';
import { IRejectSellerKycUsecase } from '@application/interfaces/usecases/admin/IRejectSellerKycUsecase';
import { AdminMapperProfile } from '@application/mappers/admin/admin.mapper';
import { TYPES } from '@di/types.di';
import { KycFor } from '@domain/entities/kyc/kyc.entity';
import { IKycRepository } from '@domain/repositories/IKycRespository';
import { Result } from '@domain/shared/result';
import { ZodRejectSellerKycInputType } from '@presentation/validators/schemas/admin/rejectSellerKyc.schema';
import { inject, injectable } from 'inversify';

@injectable()
export class RejectSellerKycUseCase implements IRejectSellerKycUsecase {
    constructor(
        @inject(TYPES.IKycRepository)
        private readonly _kycRepository: IKycRepository,
    ) {}

    async execute(
        data: ZodRejectSellerKycInputType,
    ): Promise<Result<IRejectSellerKycOutput>> {
        const dto = AdminMapperProfile.toRejectSellerKycInputDto(data);
        const { sellerId } = dto;

        const kycResult = await this._kycRepository.findByUserIdAndFor(
            sellerId,
            KycFor.SELLER,
        );

        if (kycResult.isFailure) {
            return Result.fail(kycResult.getError());
        }

        const kyc = kycResult.getValue();
        if (!kyc) {
            return Result.fail('KYC record not found for this seller');
        }

        const rejectResult = kyc.rejectKyc(data.reason);
        if (rejectResult.isFailure) {
            return Result.fail(rejectResult.getError());
        }

        await this._kycRepository.save(kyc);
        return Result.ok({ success: true });
    }
}
