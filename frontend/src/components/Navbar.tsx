import { Link } from "react-router-dom"

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">Reel Local</div>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/movies">Movies</Link>
        <Link to="/schedule">Schedule</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  )
}

export default Navbar