export const API_BASE_URL = 'http://localhost:3000/api';

const getRuntimeApiBaseUrl = (): string => {
  const browserStorage = typeof localStorage !== 'undefined'
    ? localStorage.getItem('viras_api_base_url')
    : null;

  return browserStorage || API_BASE_URL;
};

export const apiUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getRuntimeApiBaseUrl()}${normalizedPath}`;
};
