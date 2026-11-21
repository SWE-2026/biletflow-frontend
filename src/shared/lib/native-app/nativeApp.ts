declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (message: string) => void }
  }
}

export function isNativeApp(): boolean {
  return typeof window !== 'undefined' && window.ReactNativeWebView !== undefined
}

function post(message: object) {
  window.ReactNativeWebView?.postMessage(JSON.stringify(message))
}

export function postSessionToNativeApp(session: object | null) {
  post({ type: 'session', session })
}

export function sendFileToNativeApp(blob: Blob, fileName: string) {
  const reader = new FileReader()
  reader.onload = () => {
    if (typeof reader.result !== 'string') return
    const base64 = reader.result.slice(reader.result.indexOf(',') + 1)
    post({ type: 'download', fileName, mimeType: blob.type || 'application/octet-stream', base64 })
  }
  reader.readAsDataURL(blob)
}
