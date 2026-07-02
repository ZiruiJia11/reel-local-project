export type ToastType =
  "success" |
  "error" |
  "info"

export type ToastEventDetail = {
  message: string
  type: ToastType
}

export function showToast(
  message: string,
  type: ToastType = "info",
) {
  window.dispatchEvent(
    new CustomEvent<ToastEventDetail>(
      "reel-local-toast",
      {
        detail: {
          message,
          type,
        },
      },
    ),
  )
}
