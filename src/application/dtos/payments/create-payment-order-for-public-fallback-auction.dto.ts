export interface ICreatePaymentOrderForPublicFallbackAuctionInputDto {
    auctionId: string;
    userId: string;
}

export interface ICreatePaymentOrderForPublicFallbackAuctionOutputDto {
    orderId: string;
    amountInPaise: number;
    currency: string;
    gatewayKey: string;
}
