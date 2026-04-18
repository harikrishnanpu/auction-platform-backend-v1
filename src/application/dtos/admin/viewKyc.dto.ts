import { Readable } from 'node:stream';

export interface IViewKycInputDto {
    documentId: string;
}

export interface IViewKycOutputDto {
    stream: Readable;
    contentType: string;
}
