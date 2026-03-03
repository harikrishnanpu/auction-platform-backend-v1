export interface RegisterUserInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterUserOutput {
  message: string;
  userId: string;
}
