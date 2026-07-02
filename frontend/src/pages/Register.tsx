import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { register } from "../services/authService"
import { showToast } from "../services/toastService"

function Register() {
  const navigate =
    useNavigate()

  const [name, setName] =
    useState("")

  const [email, setEmail] =
    useState("")

  const [password, setPassword] =
    useState("")

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault()

    try {
      await register(
        name,
        email,
        password,
      )

      showToast(
        "Account created. Please log in.",
        "success",
      )

      navigate("/login")
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Registration failed",
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
          Register
        </h1>

        <label>
          Name

          <input
            value={name}
            onChange={
              event =>
                setName(
                  event.target.value
                )
            }
            required
          />
        </label>

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

        <button type="submit">
          Create Account
        </button>
      </form>
    </div>
  )
}

export default Register
