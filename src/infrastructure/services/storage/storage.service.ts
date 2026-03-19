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
import { Readable } from 'node:stream';

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

  async streamFile(data: {
    fileKey: string;
  }): Promise<Result<{ stream: Readable; contentType: string }>> {
    try {
      const command = new GetObjectCommand({
        Bucket: this._bucketName,
        Key: data.fileKey,
      });

      const { Body, ContentType } = await this._s3Client.send(command);

      if (!Body || !(Body instanceof Readable)) {
        return Result.fail('Failed to retrieve a readable stream from S3.');
      }

      return Result.ok<{ stream: Readable; contentType: string }>({
        stream: Body as Readable,
        contentType: ContentType as string,
      });
    } catch {
      return Result.fail('UNEXPECTED ERROR FROM STREAM FILE');
    }
  }
}
