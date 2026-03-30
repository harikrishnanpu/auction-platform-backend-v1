export interface ICreateWalletTopupSessionInputDto {
    userId: string;
    amount: number;
}

export interface ICreateWalletTopupSessionOutputDto {
    orderId: string;
    amountInPaise: number;
    currency: string;
    gatewayKey: string;
}
