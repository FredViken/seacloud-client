export declare namespace SeaCloud {
  interface User {
    id: string;
    name: string;
    email: string;
  }

  interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
  }

  type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

  type UserWithMetadata = User & {
    lastLogin: Date;
    preferences: Record<string, unknown>;
  };

  interface RequestOptions {
    method: HttpMethod;
    headers?: Record<string, string>;
    body?: any;
  }

  type ErrorHandler = (error: Error) => void;

  interface AuthResponse {
    idToken: string;
    refreshToken: string;
  }

  interface SeacloudClientOptions {
    baseURL?: string;
  }
}
