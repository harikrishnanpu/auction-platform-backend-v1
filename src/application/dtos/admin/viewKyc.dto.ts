import { Readable } from 'node:stream';

export interface IViewKycInputDto {
  userId: string;
  documentId: string;
}

export interface IViewKycOutputDto {
  stream: Readable;
  contentType: string;
}
