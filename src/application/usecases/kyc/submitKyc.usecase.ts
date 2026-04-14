import { ISubmitKycOutput } from '@application/dtos/kyc/submit-kyc.dto';
import { ISubmitKycUsecase } from '@application/interfaces/usecases/kyc/ISubmitKycUsecase';
import { TYPES } from '@di/types.di';
import { IKycRepository } from '@domain/repositories/IKycRespository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';
import { ZodSubmitKycInputType } from '@presentation/validators/schemas/kyc/submitKyc.schema';
import { KycMapperProfile } from '@application/mappers/kyc/kyc.mapper';

@injectable()
export class SubmitKycUsecase implements ISubmitKycUsecase {
    constructor(
        @inject(TYPES.IKycRepository)
        private readonly _kycRepository: IKycRepository,
    ) {}

    async execute(
        data: ZodSubmitKycInputType,
    ): Promise<Result<ISubmitKycOutput>> {
        try {
            const dto = KycMapperProfile.toSubmitKycInputDto(data);

            const kycEntity = await this._kycRepository.findByUserIdAndFor(
                dto.userId,
                dto.kycFor,
            );

            if (kycEntity.isFailure || !kycEntity.getValue()) {
                return Result.fail(kycEntity.getError());
            }

            const kyc = kycEntity.getValue();

            if (!kyc) {
                return Result.fail('KYC record not found for this user');
            }

            const submit = kyc.submitKyc();

            if (submit.isFailure) {
                return Result.fail(submit.getError());
            }

            await this._kycRepository.save(kyc);

            const output: ISubmitKycOutput = {
                status: kyc.getKycStatus(),
            };

            return Result.ok(output);
        } catch (error) {
            console.log(error);
            return Result.fail('UNEXPECTED ERROR FROM SUBMIT KYC USECASE');
        }
    }
}
