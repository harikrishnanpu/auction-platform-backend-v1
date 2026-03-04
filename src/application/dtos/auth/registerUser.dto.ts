export interface RegisterUserInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  address: string;
}

export interface RegisterUserOutput {
  userId: string;
}
