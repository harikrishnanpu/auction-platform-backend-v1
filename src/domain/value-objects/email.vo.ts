export class Email {
  private readonly value: string;

  constructor(email: string) {
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }

    this.value = email.toLowerCase();
  }

  getValue(): string {
    return this.value;
  }
}
