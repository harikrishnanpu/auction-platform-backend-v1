export interface IVerifyPublicFallbackAuctionPaymentInputDto {
    userId: string;
    orderId: string;
    signature: string;
    auctionId: string;
}

export interface IVerifyPublicFallbackAuctionPaymentOutputDto {
    success: boolean;
}
