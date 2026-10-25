/**
 * Environment configuration for the web app.
 */
export const env = {
  dataMode: (import.meta.env.VITE_DATA_MODE ?? 'mock') as 'mock' | 'api',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;

export function isMockMode(): boolean {
  return env.dataMode === 'mock';
}
