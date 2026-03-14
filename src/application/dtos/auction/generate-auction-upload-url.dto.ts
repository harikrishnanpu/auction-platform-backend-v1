export interface IGenerateAuctionUploadUrlInput {
  userId: string;
  contentType: string;
  fileName: string;
  fileSize: number;
}

export interface IGenerateAuctionUploadUrlOutput {
  uploadUrl: string;
  fileKey: string;
}
