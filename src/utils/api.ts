import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError,AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

interface ApiResponse<T = unknown> { 
  status: number;
  statusText: string;
  token: string;
  data: T
}

interface ErrorResponse {
  message: string;
}

const API: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL_BACK_END,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,  
  });

  API.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      if (axios.isAxiosError(error) && (error.response?.status === 401)) {
        console.error('Unauthorized access - redirecting to login');
        localStorage.removeItem('token');
        toast.error(error.message) 
      }  
      return Promise.reject(error);
    }
  );

  API.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => { 
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError): Promise<AxiosError> => {
      return Promise.reject(error);
    }
  );

  export const get = async <T = unknown>(url: string): Promise<T> => {
    try {
      const response = await API.get<T>(url); 
      return response.data;  
    } catch (error) {
      console.error('GET request failed:', error);
      throw error;
    }
  };
  
  export const post = async <T = unknown>(
    url: string,
    data: unknown
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await API.post<ApiResponse<T>>(url, data);
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('POST request failed:', error);
      throw error;
    }
  };

  export const handleApiError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return axiosError.response?.data?.message || 
             axiosError.message || 
             'An error occurred while processing your request';
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  };

  export const postData = async <T = unknown>(
    url: string,
    data: unknown
  ): Promise<T> => {
    try {
      const response = await API.post<T>(url, data);
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('POST request failed:', error);
      throw error;
    }
  };

export default API;