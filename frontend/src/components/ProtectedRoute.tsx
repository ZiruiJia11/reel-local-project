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
  requiredRole?: string
}

function ProtectedRoute({
  children,
  requiredRole,
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

  if (
    requiredRole &&
    user.role !== requiredRole
  ) {
    return (
      <Navigate
        to="/"
      />
    )
  }

  return children
}

export default ProtectedRoute
