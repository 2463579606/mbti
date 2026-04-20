/**
 * Standard API Response Format
 */

export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  timestamp: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Create a success response
 */
export function successResponse<T>(
  data?: T,
  message: string = 'success',
  code: number = 200
): ApiResponse<T> {
  return {
    success: true,
    code,
    message,
    data,
    timestamp: Date.now(),
  };
}

/**
 * Create an error response
 */
export function errorResponse(
  message: string,
  code: number = 500,
  data?: any
): ApiResponse {
  return {
    success: false,
    code,
    message,
    data,
    timestamp: Date.now(),
  };
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): ApiResponse<PaginatedResponse<T>> {
  const totalPages = Math.ceil(total / limit);

  return successResponse({
    items,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  });
}

/**
 * Response builder for fluent API
 */
export class ResponseBuilder {
  private response: ApiResponse = {
    success: true,
    code: 200,
    message: 'success',
    timestamp: Date.now(),
  };

  static create(): ResponseBuilder {
    return new ResponseBuilder();
  }

  success(): ResponseBuilder {
    this.response.success = true;
    return this;
  }

  error(): ResponseBuilder {
    this.response.success = false;
    return this;
  }

  code(code: number): ResponseBuilder {
    this.response.code = code;
    return this;
  }

  message(message: string): ResponseBuilder {
    this.response.message = message;
    return this;
  }

  data<T>(data: T): ResponseBuilder {
    this.response.data = data;
    return this;
  }

  build(): ApiResponse {
    return { ...this.response };
  }
}
