export interface IRejectSellerKycInput {
  sellerId: string;
  reason?: string;
}

export interface IRejectSellerKycOutput {
  success: boolean;
}
