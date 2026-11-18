import axios, { AxiosError } from 'axios';
import { Persona } from '../types/ticket';

export const PREDEFINED_PERSONAS: Persona[] = [
  { userId: 'alice.employee', name: 'Alice Walker', role: 'EMPLOYEE' },
  { userId: 'charlie.employee', name: 'Charlie Davis', role: 'EMPLOYEE' },
  { userId: 'bob.support', name: 'Bob Tech', role: 'SUPPORT_STAFF' },
];

export const DEFAULT_PERSONA = PREDEFINED_PERSONAS[0];

let currentPersona: Persona = DEFAULT_PERSONA;

export const setClientPersona = (persona: Persona) => {
  currentPersona = persona;
};

export const getClientPersona = (): Persona => {
  return currentPersona;
};

export const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    config.headers['X-User-Id'] = currentPersona.userId;
    config.headers['X-User-Role'] = currentPersona.role;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface BackendErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
}

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<BackendErrorResponse>;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

