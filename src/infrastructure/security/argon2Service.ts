import * as argon2 from 'argon2';

export class Argon2Service {
  async hash(password: string): Promise<string> {
    return await argon2.hash(password, {
      type: argon2.argon2id,
    });
  }

  async verify(hash: string, password: string): Promise<boolean> {
    console.log('kjjbfhbdhjfbjhbfjhf');
    console.log(hash);
    console.log(password);

    return await argon2.verify(hash, password);
  }
}
