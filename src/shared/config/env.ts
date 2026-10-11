const rawApiUrl: string | undefined = import.meta.env.VITE_API_URL

/**
 * Base URL of the BiletFlow API, including `/api/v1`. Defaults to the local API started with
 * `docker compose up` in biletflow-api.
 */
export const apiUrl = (rawApiUrl || 'http://localhost:8080/api/v1').replace(/\/+$/, '')
