export interface AvatarUploadUrlRequestDto {
  userId: string;
  contentType: string;
  fileName: string;
  fileSize: number;
}

export interface AvatarUploadUrlResponseDto {
  uploadUrl: string;
  fileKey: string;
}
