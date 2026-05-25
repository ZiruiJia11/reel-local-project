import { useParams } from "react-router-dom"
import { movies } from "../services/movieData"
import { addBooking } from "../services/bookingService"


function MovieDetails() {

  const { id } = useParams()

  const movie =
    movies.find(
      m => m.id === id
    )

  if (!movie) {
    return (
      <h1>
        Movie not found
      </h1>
    )
  }

  return (
    <div>

      <img
        src={movie.image}
        width="300"
      />

      <h1>
        {movie.title}
      </h1>

      <p>
        {movie.genre}
      </p>

      <p>
        {movie.duration}
      </p>

      <p>
        {movie.description}
      </p>

      <button
        onClick={() => {
          addBooking(movie.id)
          alert("Seat booked")
        }}
      >
        Book a Seat
      </button>

    </div>
  )
}

export default MovieDetails