export enum AuctionAssetType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

export class AuctionAsset {
  constructor(
    private readonly id: string,
    private readonly auctionId: string,
    private readonly fileKey: string,
    private readonly position: number,
    private readonly assetType: AuctionAssetType,
  ) {}

  static create({
    id,
    auctionId,
    fileKey,
    position = 0,
    assetType = AuctionAssetType.IMAGE,
  }: {
    id: string;
    auctionId: string;
    fileKey: string;
    position?: number;
    assetType?: AuctionAssetType;
  }): AuctionAsset {
    return new AuctionAsset(id, auctionId, fileKey, position, assetType);
  }

  getId(): string {
    return this.id;
  }

  getAuctionId(): string {
    return this.auctionId;
  }

  getFileKey(): string {
    return this.fileKey;
  }

  getPosition(): number {
    return this.position;
  }

  getAssetType(): AuctionAssetType {
    return this.assetType;
  }
}
