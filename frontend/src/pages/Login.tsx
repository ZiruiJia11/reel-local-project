import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { login } from "../services/authService"
import { showToast } from "../services/toastService"

function Login() {

  const navigate =
    useNavigate()

  const [email, setEmail] =
    useState("")

  const [password, setPassword] =
    useState("")

  async function handleSubmit(
    event: React.FormEvent
  ) {

    event.preventDefault()

    try {

      await login(
        email,
        password,
      )

      showToast(
        "Logged in successfully",
        "success",
      )

      navigate(
        "/profile"
      )

    } catch (error) {

      showToast(
        error instanceof Error
          ? error.message
          : "Invalid email or password",
        "error",
      )

    }

  }

  return (
    <div className="form-page">

      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >

        <h1>
          Login
        </h1>

        <label>
          Email

          <input
            type="email"
            value={email}
            onChange={
              event =>
                setEmail(
                  event.target.value
                )
            }
            required
          />

        </label>

        <label>
          Password

          <input
            type="password"
            value={password}
            onChange={
              event =>
                setPassword(
                  event.target.value
                )
            }
            required
          />

        </label>

        <button
          type="submit"
        >
          Login
        </button>

      </form>

    </div>
  )
}

export default Login
