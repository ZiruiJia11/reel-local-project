import { useNavigate } from "react-router-dom"

function Home() {

  const navigate = useNavigate()

  return (
    <div className="hero">

      <h1>
        Reel Local Cinema
      </h1>

      <p>
        Discover local screenings,
        reserve your seat,
        and connect with movie lovers.
      </p>

      <button
        onClick={() => navigate("/movies")}
      >
        Browse Movies
      </button>

    </div>
  )
}

export default Home