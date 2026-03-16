export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  status: number;
  error: string | null;
}
