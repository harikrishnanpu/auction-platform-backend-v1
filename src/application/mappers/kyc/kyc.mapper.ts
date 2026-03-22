import { IGetKycStatusInput } from '@application/dtos/kyc/get-kyc-status.usecase';
import { ISubmitKycInput } from '@application/dtos/kyc/submit-kyc.dto';
import { IUpdateKycInput } from '@application/dtos/kyc/update-kyc.dto';
import { UploadKycGetUrlInput } from '@application/dtos/kyc/upload-kyc.dto';
import { ZodGetKycStatusInputType } from '@presentation/validators/schemas/kyc/getKycStatus.schema';
import { ZodSubmitKycInputType } from '@presentation/validators/schemas/kyc/submitKyc.schema';
import { ZodUpdateKycInputType } from '@presentation/validators/schemas/kyc/updateKyc.schema';
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
    data: ZodGetKycStatusInputType,
    userId: string,
  ): IGetKycStatusInput {
    return {
      userId: userId,
      kycFor: data.kycFor,
    };
  }

  public static toUpdateKycInput(
    data: ZodUpdateKycInputType,
    userId: string,
  ): IUpdateKycInput {
    return {
      userId: userId,
      kycFor: data.kycFor,
      documentType: data.documentType,
      side: data.side,
      documentUrl: data.fileKey,
    };
  }

  public static toSubmitKycInput(
    data: ZodSubmitKycInputType,
    userId: string,
  ): ISubmitKycInput {
    return {
      userId: userId,
      kycFor: data.kycFor,
    };
  }
}
