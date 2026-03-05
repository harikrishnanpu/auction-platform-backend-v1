export class Kyc {
  constructor(
    private readonly verified: boolean,
    private readonly documentId?: string,
  ) {}

  isVerified(): boolean {
    return this.verified;
  }

  verify(): Kyc {
    return new Kyc(true, this.documentId);
  }
}
