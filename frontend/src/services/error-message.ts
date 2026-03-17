import { AxiosError } from 'axios';

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.error?.message || error.response?.data?.message || fallback;
  }

  return fallback;
}
