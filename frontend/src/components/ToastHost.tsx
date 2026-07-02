import {
  useEffect,
  useState,
} from "react"

import type {
  ToastEventDetail,
  ToastType,
} from "../services/toastService"

import "./ToastHost.css"

type Toast = {
  id: number
  message: string
  type: ToastType
}

function ToastHost() {
  const [toasts, setToasts] =
    useState<Toast[]>([])

  useEffect(() => {
    function handleToast(
      event: Event,
    ) {
      const toastEvent =
        event as CustomEvent<ToastEventDetail>

      const id =
        Date.now()

      setToasts(current => [
        ...current,
        {
          id,
          message:
            toastEvent.detail.message,
          type:
            toastEvent.detail.type,
        },
      ])

      window.setTimeout(() => {
        setToasts(current =>
          current.filter(
            toast =>
              toast.id !== id,
          ),
        )
      }, 3200)
    }

    window.addEventListener(
      "reel-local-toast",
      handleToast,
    )

    return () => {
      window.removeEventListener(
        "reel-local-toast",
        handleToast,
      )
    }
  }, [])

  return (
    <div className="toast-region">
      {
        toasts.map(toast => (
          <div
            className={`toast toast-${toast.type}`}
            key={toast.id}
          >
            {toast.message}
          </div>
        ))
      }
    </div>
  )
}

export default ToastHost
