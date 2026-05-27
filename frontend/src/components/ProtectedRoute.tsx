import type {
  ReactNode
}
from "react"

import {
  Navigate
}
from "react-router-dom"

import {
  getCurrentUser
}
from "../services/authService"

type Props = {
  children: ReactNode
}

function ProtectedRoute({
  children,
}: Props) {

  const user =
    getCurrentUser()

  if (!user) {

    return (
      <Navigate
        to="/login"
      />
    )

  }

  return children
}

export default ProtectedRoute