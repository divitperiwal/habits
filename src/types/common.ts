import type { JWTPayload } from "jose";

export interface SuccessResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data?: any;
}

export interface ErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  errors?: any;
}

export interface ApiErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  details?: any;
}

export interface TokenPayload extends JWTPayload {
  id: string;
  email: string;
}

