export const AUTH_TYPES = {
  PrismaClient: Symbol.for('PrismaClient'),
  UserRepository: Symbol.for('UserRepository'),
  RegisterUseCase: Symbol.for('RegisterUseCase'),
  AuthController: Symbol.for('AuthController'),
  PasswordService: Symbol.for('PasswordService'),
  IdGeneratingService: Symbol.for('IdGeneratingService'),
};
