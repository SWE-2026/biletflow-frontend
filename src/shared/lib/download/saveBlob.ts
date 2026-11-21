import { isNativeApp, sendFileToNativeApp } from '@/shared/lib/native-app'

/** Hands a fetched file to the browser (or the mobile app) as a download named `filename`. */
export function saveBlob(blob: Blob, filename: string) {
  if (isNativeApp()) {
    sendFileToNativeApp(blob, filename)
    return
  }
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  // Give the browser a moment to start the download before releasing the file
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
