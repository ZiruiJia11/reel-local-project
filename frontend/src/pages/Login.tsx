import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { login } from "../services/authService"

function Login() {
  const navigate = useNavigate()

  const [name, setName] =
    useState("")

  const [email, setEmail] =
    useState("")

  function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault()

    login({
      name,
      email,
    })

    navigate("/profile")
  }

  return (
    <div className="form-page">
      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >
        <h1>Login</h1>

        <label>
          Name
          <input
            value={name}
            onChange={
              event =>
                setName(event.target.value)
            }
            placeholder="Steven Jia"
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
                setEmail(event.target.value)
            }
            placeholder="steven@example.com"
            required
          />
        </label>

        <button type="submit">
          Login
        </button>
      </form>
    </div>
  )
}

export default Login