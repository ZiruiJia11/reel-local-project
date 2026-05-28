import { useNavigate } from "react-router-dom"
import { movies } from "../services/movieData"
import "./Movies.css"

function Movies() {
  const navigate = useNavigate()

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <div
          key={movie.id}
          className="movie-card"
          onClick={() => navigate(`/movies/${movie.id}`)}
        >
          <img
            src={movie.image}
            alt={movie.title}
          />

          <h2>
            {movie.title}
          </h2>
        </div>
      ))}
    </div>
  )
}

export default Movies