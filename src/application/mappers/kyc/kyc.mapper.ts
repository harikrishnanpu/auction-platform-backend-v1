import { IGetKycStatusInput } from '@application/dtos/kyc/get-kyc-status.usecase';
import { ISubmitKycInput } from '@application/dtos/kyc/submit-kyc.dto';
import { IUpdateKycInput } from '@application/dtos/kyc/update-kyc.dto';
import { UploadKycGetUrlInput } from '@application/dtos/kyc/upload-kyc.dto';
import { IValidatedGetKycStatusInput } from '@application/interfaces/usecases/kyc/IGetKycStatusUsecase';
import { IValidatedSubmitKycInput } from '@application/interfaces/usecases/kyc/ISubmitKycUsecase';
import { IValidatedUpdateKycInput } from '@application/interfaces/usecases/kyc/IUpdateKyc';
import { ZodUploadKycUrlInputType } from '@presentation/validators/schemas/kyc/uploadKyc.schema';

export class KycMapperProfile {
    public static toUploadKycUrlInput(
        data: ZodUploadKycUrlInputType,
    ): UploadKycGetUrlInput {
        return {
            kycFor: data.kycFor,
            fileName: data.fileName,
            contentType: data.contentType,
            fileSize: data.fileSize,
        };
    }

    public static toGetKycStatusInput(
        data: IValidatedGetKycStatusInput,
    ): IGetKycStatusInput {
        return {
            userId: data.userId,
            kycFor: data.kycFor,
        };
    }

    public static toUpdateKycInput(
        data: IValidatedUpdateKycInput,
    ): IUpdateKycInput {
        return {
            userId: data.userId,
            kycFor: data.kycFor,
            documentType: data.documentType,
            side: data.side,
            documentUrl: data.fileKey,
        };
    }

    public static toSubmitKycInputDto(
        data: IValidatedSubmitKycInput,
    ): ISubmitKycInput {
        return {
            userId: data.userId,
            kycFor: data.kycFor,
        };
    }
}
