import { Link, useNavigate } from "react-router-dom"
import "./Navbar.css"

import {
  getCurrentUser,
  logout,
} from "../services/authService"

function Navbar() {

  const navigate =
    useNavigate()

  const user =
    getCurrentUser()

  function handleLogout() {

    logout()

    navigate("/")

    window.location.reload()

  }

  return (
    <nav className="navbar">

      <div className="navbar-logo">
        Reel Local
      </div>

      <div className="navbar-links">

        <Link to="/">
          Home
        </Link>

        <Link to="/movies">
          Movies
        </Link>

        {
          user &&
          (
            <Link to="/schedule">
              Schedule
            </Link>
          )
        }

        {
          user &&
          user.role === "ADMIN" &&
          (
            <Link to="/admin">
              Admin
            </Link>
          )
        }

        {
          user &&
          (
            <Link to="/profile">
              Profile
            </Link>
          )
        }

        {
          !user &&
          (
            <><Link to="/login">
              Login
            </Link><Link to="/register">
                Register
              </Link></>
          )
        }

        {
          user &&
          (
            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          )
        }

      </div>

    </nav>
  )
}

export default Navbar
