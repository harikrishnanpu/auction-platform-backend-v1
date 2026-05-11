import { IAuctionNumberGeneratingService } from '@application/interfaces/services/IAuctionNumberGeneratingService';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    10,
);

export class GenerateAuctionNumberService implements IAuctionNumberGeneratingService {
    generateAuctionNumber(): string {
        const date = new Date();
        return `auc_${date.getFullYear()}${date.getMonth()}${date.getDate()}_${nanoid(10)}`;
    }
}
