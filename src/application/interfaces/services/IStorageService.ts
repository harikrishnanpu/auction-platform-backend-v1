import { Result } from '@domain/shared/result';

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
}
