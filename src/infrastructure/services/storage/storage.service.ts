import {
  GenerateDownloadUrlData,
  GenerateUploadUrlData,
  IStorageService,
} from '@application/interfaces/services/IStorageService';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { TYPES } from '@di/types.di';
import { Result } from '@domain/shared/result';
import { S3_CONSTANTS } from '@infrastructure/constants/storage/s3.constants';
import { inject, injectable } from 'inversify';

@injectable()
export class S3StorageService implements IStorageService {
  private _bucketName: string;

  constructor(
    @inject(TYPES.S3Client)
    private readonly _s3Client: S3Client,
  ) {
    if (!process.env.AWS_BUCKET_NAME) {
      throw new Error('AWS_BUCKET_NAME is not defined');
    }

    this._bucketName = process.env.AWS_BUCKET_NAME;
  }

  async generateUploadUrl(
    data: GenerateUploadUrlData,
  ): Promise<Result<string>> {
    try {
      const command = new PutObjectCommand({
        Bucket: this._bucketName,
        Key: data.fileName,
        ContentType: data.contentType,
        ContentLength: data.fileSize,
      });

      const signedUrl = await getSignedUrl(this._s3Client, command, {
        expiresIn: S3_CONSTANTS.UPLOAD_URL_EXPIRATION,
      });

      return Result.ok(signedUrl);
    } catch (error) {
      console.log(error);
      return Result.fail('UNEXPECTED ERROR FROM GENERATE UPLOAD URL');
    }
  }

  async generateDownloadUrl(
    data: GenerateDownloadUrlData,
  ): Promise<Result<string>> {
    try {
      const command = new GetObjectCommand({
        Bucket: this._bucketName,
        Key: data.fileKey,
      });

      const signedUrl = await getSignedUrl(this._s3Client, command, {
        expiresIn: S3_CONSTANTS.DOWNLOAD_URL_EXPIRATION,
      });
      return Result.ok(signedUrl);
    } catch (error) {
      console.log(error);
      return Result.fail('UNEXPECTED ERROR FROM GENERATE DOWNLOAD URL');
    }
  }
}
