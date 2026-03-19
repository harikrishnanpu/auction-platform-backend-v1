import { Result } from '@domain/shared/result';
import { Readable } from 'node:stream';

export interface GenerateUploadUrlData {
  contentType: string;
  fileName: string;
  fileSize: number;
}

export interface GenerateDownloadUrlData {
  fileKey: string;
}

export interface IStorageService {
  generateUploadUrl(data: GenerateUploadUrlData): Promise<Result<string>>;
  generateDownloadUrl(data: GenerateDownloadUrlData): Promise<Result<string>>;
  streamFile(data: {
    fileKey: string;
  }): Promise<Result<{ stream: Readable; contentType: string }>>;
}
