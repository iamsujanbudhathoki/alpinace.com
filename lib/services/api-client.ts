import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const AUTH_KEY = 'alpineace_admin_session';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach Authorization Bearer Token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      try {
        const session = localStorage.getItem(AUTH_KEY);
        if (session) {
          const parsed = JSON.parse(session);
          if (parsed.token) {
            config.headers.Authorization = `Bearer ${parsed.token}`;
          }
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Error extraction & status verification
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiResponse<null>>) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_KEY);
    }
    const apiErr = error.response?.data;
    const message = apiErr?.message || (apiErr?.errors && apiErr.errors.join(', ')) || error.message || 'API request failed';
    return Promise.reject(new Error(message));
  }
);

export async function apiRequest<T>(
  endpoint: string,
  options: { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: any; params?: any } = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, params } = options;
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const response = await axiosInstance.request<any>({
    url,
    method,
    data: body,
    params,
  });

  const resData = response.data;

  if (resData && typeof resData === 'object' && !Array.isArray(resData)) {
    const isSuccess = resData.success !== undefined
      ? Boolean(resData.success)
      : response.status >= 200 && response.status < 300;

    const msg = resData.message || (isSuccess ? "Operation completed successfully" : "An error occurred");
    const payload = resData.data !== undefined ? resData.data : resData;

    return {
      success: isSuccess,
      message: msg,
      data: payload as T,
    };
  }

  return {
    success: response.status >= 200 && response.status < 300,
    message: "Operation completed successfully",
    data: resData as T,
  };
}

export const apiClient = {
  get: <T>(endpoint: string, params?: any) => apiRequest<T>(endpoint, { method: 'GET', params }),
  post: <T>(endpoint: string, body?: any) => apiRequest<T>(endpoint, { method: 'POST', body }),
  put: <T>(endpoint: string, body?: any) => apiRequest<T>(endpoint, { method: 'PUT', body }),
  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),
};

