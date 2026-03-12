export interface UserProfile {
  userId: string;
  fullName: string;
  about: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: Array<{
    [key: string]: any;
  }>;
}
