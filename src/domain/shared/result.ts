export class Result<T> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  private readonly error: string | null;
  private readonly value: T | null;

  private constructor(
    isSuccess: boolean,
    error?: string | null,
    value?: T | null,
  ) {
    if (isSuccess && error) {
      throw new Error(
        'InvalidOperation: result cannot be successful and contain an error',
      );
    }

    if (!isSuccess && !error) {
      throw new Error('InvalidOperation: failing result must contain an error');
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error ?? null;
    this.value = value ?? null;
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, null, value ?? null);
  }

  public static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error, null);
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error('Cannot get value: failed result');
    }
    return this.value as T;
  }

  public getError(): string {
    if (this.isSuccess) {
      throw new Error('Cannot get error: successful result');
    }
    return this.error as string;
  }
}
