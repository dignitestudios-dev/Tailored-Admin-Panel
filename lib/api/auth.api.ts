import axios from 'axios';
import { API } from './axios';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type AdminLoginPayload = {
  email: string;
  password: string;
};

export type AdminLoginData = {
  token: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_EMAIL_KEY = 'authEmail';

const resolveApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const messageFromApi =
      (error.response?.data as { message?: string } | undefined)?.message;
    return messageFromApi ?? fallback;
  }

  return fallback;
};

export async function adminLogin(payload: AdminLoginPayload): Promise<ApiResponse<AdminLoginData>> {
  try {
    const response = await API.post<ApiResponse<AdminLoginData>>('/admin/login', payload);
    const responseData = response.data;

    if (!responseData.success || !responseData.data?.token) {
      throw new Error(responseData.message || 'Invalid email or password.');
    }

    localStorage.setItem(AUTH_TOKEN_KEY, responseData.data.token);
    localStorage.setItem(AUTH_EMAIL_KEY, payload.email);

    return responseData;
  } catch (error) {
    throw new Error(resolveApiErrorMessage(error, 'Invalid email or password.'));
  }
}

export async function adminForgotPassword(
  payload: ForgotPasswordPayload
): Promise<ApiResponse<null>> {
  try {
    const response = await API.post<ApiResponse<null>>('/admin/forgot-password', payload);
    return response.data;
  } catch (error) {
    throw new Error(
      resolveApiErrorMessage(
        error,
        'Unable to process forgot password request right now.'
      )
    );
  }
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_EMAIL_KEY);
}

export function getStoredAuthSession() {
  if (typeof window === 'undefined') {
    return {
      token: null,
      email: null,
    };
  }

  return {
    token: localStorage.getItem(AUTH_TOKEN_KEY),
    email: localStorage.getItem(AUTH_EMAIL_KEY),
  };
}
