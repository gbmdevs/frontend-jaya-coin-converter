import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
}

const API: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL_BACK_END || 'http://localhost:3000', // Fallback for dev
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,  
  });

  API.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.error('Unauthorized access - redirecting to login');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  API.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  export const get = async <T = unknown>(url: string): Promise<T> => {
    try {
      const response = await API.get<ApiResponse<T>>(url);
      return response.data.data;  
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

export default API;