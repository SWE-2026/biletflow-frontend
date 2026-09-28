const rawApiUrl: string | undefined = import.meta.env.VITE_API_URL

/** Base URL of the BiletFlow API. Unset means the app runs against in-browser demo mocks. */
export const apiUrl = rawApiUrl?.replace(/\/+$/, '') ?? ''

export const isDemoMode = apiUrl === ''
