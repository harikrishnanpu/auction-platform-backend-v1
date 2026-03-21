export interface RegisterUserInputDto {
  name: string;
  email: string;
  phone: string;
  password: string;
  address: string;
}

export interface RegisterUserOutputDto {
  userId: string;
}
