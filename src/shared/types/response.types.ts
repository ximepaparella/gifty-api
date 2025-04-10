export type ApiResponseStatus = 'success' | 'error' | 'fail';

export interface ApiResponse<T = any> {
  status: ApiResponseStatus;
  message?: string;
  data?: T;
}

export interface PaginatedApiResponse<T = any> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ApiErrorResponse extends ApiResponse<never> {
  status: 'error' | 'fail';
  message: string;
  code: string;
  details?: unknown;
  stack?: string; // Only in development
}

// Helper type for consistent error details
export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: unknown;
}

// Response wrapper utility type
export type ApiResponseWrapper<T> = Promise<ApiResponse<T>>;
