export interface IVerifyPublicFallbackAuctionPaymentInputDto {
    userId: string;
    orderId: string;
    signature: string;
    paymentId: string;
}

export interface IVerifyPublicFallbackAuctionPaymentOutputDto {
    success: boolean;
}
