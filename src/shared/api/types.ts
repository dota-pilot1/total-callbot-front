export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  memberId: number;
  email: string;
  name: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
}