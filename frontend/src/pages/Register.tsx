import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { register } from "../services/authService"

function Register() {
  const navigate =
    useNavigate()

  const [name, setName] =
    useState("")

  const [email, setEmail] =
    useState("")

  const [password, setPassword] =
    useState("")

  const [error, setError] =
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

      navigate("/login")
    } catch {
      setError(
        "Registration failed"
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

        {
          error &&
          (
            <p>
              {error}
            </p>
          )
        }

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