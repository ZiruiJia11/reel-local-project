import { Link } from "react-router-dom"

function Navbar() {
  return (
    <nav>
      <h2>Reel Local</h2>

      <Link to="/">Home</Link>

      <Link to="/movies">Movies</Link>

      <Link to="/schedule">Schedule</Link>

      <Link to="/profile">Profile</Link>

      <Link to="/login">Login</Link>
    </nav>
  )
}

export default Navbar