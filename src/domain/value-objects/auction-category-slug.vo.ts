import { Result } from '@domain/shared/result';

export class AuctionCategorySlug {
  private constructor(private readonly _value: string) {}

  public static create(value: string): Result<AuctionCategorySlug> {
    const trimmedValue = value.trim();

    if (trimmedValue.length === 0) {
      return Result.fail('Auction category slug cannot be empty');
    }

    return Result.ok(new AuctionCategorySlug(trimmedValue));
  }

  public getValue(): string {
    return this._value;
  }
}
