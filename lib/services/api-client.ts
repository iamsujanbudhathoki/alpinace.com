import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
const AUTH_KEY = 'alpineace_admin_session';

// ─── Response Types ───────────────────────────────────────────────────────────

export interface PaginationMeta {
  count: number;
  currentPage: number;
  nextPage: number | null;
  prevPage: number | null;
  lastPage: number;
}

/** Mirrors the backend IApiResponse shape produced by ResponseHandler */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationMeta;
  errors?: string[];
}

// ─── Axios Instance ───────────────────────────────────────────────────────────

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Error extraction & status verification
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<null>>) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_KEY);
    }
    const apiErr = error.response?.data;
    const message =
      apiErr?.message ||
      (apiErr?.errors && apiErr.errors.join(', ')) ||
      error.message ||
      'API request failed';
    // Preserve the structured error shape so responseFormatter can handle it
    return Promise.reject({ message, success: false, data: null, errors: apiErr?.errors });
  }
);

// ─── Response Formatter ───────────────────────────────────────────────────────

/**
 * Normalises any raw axios response (or caught error) into a consistent
 * ApiResponse<T> shape, mirroring the backend ResponseHandler pattern.
 */
export const responseFormatter = <T = any>(response: any): ApiResponse<T> => {
  if (!response) {
    return { success: false, message: 'No response received', data: null as T };
  }

  // If response is an already structured error or response object with explicit success flag
  if (typeof response === 'object' && 'success' in response) {
    return {
      success: Boolean(response.success),
      message: response.message || (response.success ? 'Operation completed successfully' : 'An error occurred'),
      data: response.data as T,
      pagination: response.pagination,
      errors: response.errors,
    };
  }

  // Successful axios response — response.data is the backend payload
  if (response.data !== undefined) {
    const payload = response.data;
    // Backend already wraps with { success, message, data }
    if (payload && typeof payload === 'object' && !Array.isArray(payload) && 'success' in payload) {
      return {
        success: Boolean(payload.success),
        message: payload.message || 'Operation completed successfully',
        data: payload.data as T,
        pagination: payload.pagination,
        errors: payload.errors,
      };
    }
    // Raw data (array, plain value, etc.)
    return {
      success: true,
      message: 'Operation completed successfully',
      data: payload as T,
    };
  }

  // Error path — object with { message, success, errors }
  return {
    success: false,
    message: response.message || 'An error occurred',
    data: null as T,
    errors: response.errors,
  };
};

// ─── wrapApiCall HOF ──────────────────────────────────────────────────────────

/**
 * Higher Order Function to wrap API calls with try-catch and response
 * formatting. Removes repetitive try-catch and manual responseFormatter calls.
 *
 * @example
 * const fetchUser = wrapApiCall((id: string) => axiosInstance.get(`/users/${id}`));
 * const result = await fetchUser('123'); // ApiResponse<any>
 */
export const wrapApiCall = <TArgs, TRaw>(
  apiCall: (args: TArgs) => Promise<TRaw>
) => {
  return async (args: TArgs): Promise<ApiResponse<any>> => {
    try {
      const response = await apiCall(args);
      return responseFormatter(response);
    } catch (error: any) {
      console.error('API Call Error:', error);
      return responseFormatter(error);
    }
  };
};

// ─── Core apiRequest ──────────────────────────────────────────────────────────

export async function apiRequest<T>(
  endpoint: string,
  options: { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: any; params?: any } = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, params } = options;
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  try {
    const response = await axiosInstance.request<any>({
      url,
      method,
      data: body,
      params,
    });
    return responseFormatter<T>(response);
  } catch (error: any) {
    console.error('API Request Error:', error);
    return responseFormatter<T>(error);
  }
}

// ─── apiClient shorthand ──────────────────────────────────────────────────────

export const apiClient = {
  get: <T>(endpoint: string, params?: any) =>
    apiRequest<T>(endpoint, { method: 'GET', params }),
  post: <T>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, { method: 'POST', body }),
  put: <T>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, { method: 'PUT', body }),
  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),
};

